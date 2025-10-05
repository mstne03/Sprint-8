"""In this module the api exposes the endpoints"""
import logging
import secrets
import string
from typing import List
from datetime import datetime
from sqlmodel import select, Session
import fastf1 as ff1
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from f1_api.season.utils.driver_calc import get_database_data, get_driver_stats, get_drivers_mapped
from .config.sql_init import engine
from .season.update_db import update_db
from .app import app
from .models.f1_models import Teams
from .models.app_models import (
    UserTeamsCreate, Users, UserCreate, UserResponse, UserTeams,
    Leagues, LeagueCreate, LeagueResponse, LeagueJoin, UserLeagueLink,
    UserTeamUpdate, UserTeamResponse
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # Agregar puerto 5174 también
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ff1.Cache.enable_cache(r'C:/Users/Marc/Documents/ITA/Sprint 8/f1_api/ff1_cache')

def generate_join_code(length: int = 8) -> str:
    """Generate a unique join code for leagues"""
    characters = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))

@app.post("/season/")
async def update_season():
    """
    This endpoint posts all data for the current season into the DB
    """
    await update_db(engine)
    return {"status": "updated"}

@app.get("/teams/")
async def get_teams():
    """
    This endpoint gets all of the teams for the current season from the DB
    """
    try:
        with Session(engine) as session:
            teams = session.exec(select(Teams)).all()
            teams_mapped = [
                {**team.model_dump(), "points": 0} 
                for team in teams
            ]
            
            return teams_mapped
    except Exception as e:
        logging.warning(f"/teams/ execution interrupted by the following exception: {e}")
        return []

@app.get("/drivers/")
async def get_drivers():
    """
    Returns all drivers sorted by championship points up to the last round
    """
    try:
        with Session(engine) as session:
            database_data = get_database_data(session)
            max_round = database_data["max_round"]
            sprint_rounds = database_data["sprint_rounds"]
            results = database_data["results"]
            all_results = database_data["all_results"]
            db_drivers = database_data["drivers"]

            points_map = {r.driver_id: r.total_points for r in results}

            available_points = 25 * max_round + len(sprint_rounds) * 8

            stats = get_driver_stats(all_results)
            
            drivers_sorted = sorted(
                db_drivers,
                key=lambda d: points_map.get(d.id, 0),
                reverse=True
            )

            drivers = get_drivers_mapped(max_round,stats,points_map,available_points,drivers_sorted,session)

            return drivers
    except Exception as e:
        logging.warning(f"/drivers/ execution interrupted by the following exception: {e}")
        return []

@app.post("/users/", response_model=UserResponse)
async def create_user(user: UserCreate):
    """
    Create a new user with Supabase integration
    """
    try:
        with Session(engine) as session:
            existing_user = session.exec(
                select(Users).where(
                    (Users.user_name == user.user_name) | 
                    (Users.email == user.email) |
                    (Users.supabase_user_id == user.supabase_user_id)
                )
            ).first()
            
            if existing_user:
                raise HTTPException(
                    status_code=400,
                    detail="Username, email, or Supabase user already registered"
                )
            
            new_user = Users(
                user_name=user.user_name,
                email=user.email,
                supabase_user_id=user.supabase_user_id,
                is_verified=True
            )
            
            session.add(new_user)
            session.commit()
            session.refresh(new_user)
            
            return UserResponse(
                id=new_user.id,
                user_name=new_user.user_name,
                email=new_user.email,
                is_verified=new_user.is_verified,
                created_at=new_user.created_at
            )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/user-team/")
async def create_user_team(user_team: UserTeamsCreate):
    """
    Post a new user team into the database
    """

    try:
        with Session(engine) as session:
            session.add(UserTeams(
                user_id=user_team.user_id,
                league_id=None,
                team_name=None,
                driver_1_id=user_team.driver_1_id,
                driver_2_id=user_team.driver_2_id,
                driver_3_id=user_team.driver_3_id,
                constructor_id=user_team.constructor_id,
                total_points=0,
                is_active=True,
            ))
            session.commit()
    except Exception as e:
        logging.error(f"Error creating user team: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
@app.get("/users/by-id/{supabase_user_id}")
async def get_user_by_id(supabase_user_id: str):
    with Session(engine) as session:
        user = session.exec(
            select(Users).where(Users.supabase_user_id == supabase_user_id)
        ).first()

        if not user:
            raise HTTPException(status_code=400, detail="User not found")
        
        return { "data": user }

# League Management Endpoints

@app.post("/leagues/", response_model=LeagueResponse)
async def create_league(league: LeagueCreate, admin_user_id: str):
    """
    Create a new league and automatically add the creator as admin
    """
    try:
        with Session(engine) as session:
            # Verify user exists by supabase_user_id
            user = session.exec(
                select(Users).where(Users.supabase_user_id == admin_user_id)
            ).first()
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Generate unique join code
            join_code = generate_join_code()
            while session.exec(
                select(Leagues).where(Leagues.join_code == join_code)
            ).first():
                join_code = generate_join_code()  # Regenerate if exists
            
            # Create league using the numeric user id
            new_league = Leagues(
                name=league.name,
                description=league.description,
                admin_user_id=user.id,
                join_code=join_code,
                is_active=True
            )
            
            session.add(new_league)
            session.commit()
            session.refresh(new_league)
            
            # Add creator as admin member using numeric user id
            league_link = UserLeagueLink(
                user_id=user.id,
                league_id=new_league.id,
                is_admin=True,
                is_active=True
            )
            
            session.add(league_link)
            session.commit()
            
            # Return league with current_participants = 1
            return LeagueResponse(
                id=new_league.id,
                name=new_league.name,
                description=new_league.description,
                admin_user_id=new_league.admin_user_id,
                is_active=new_league.is_active,
                join_code=new_league.join_code,
                current_participants=1,
                created_at=new_league.created_at
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating league: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/leagues/{league_id}", response_model=LeagueResponse)
async def get_league_by_id(league_id: int, user_id: str):
    """
    Get details of a specific league by ID - only for league participants
    """
    try:
        with Session(engine) as session:
            # Verify user exists by supabase_user_id
            user = session.exec(
                select(Users).where(Users.supabase_user_id == user_id)
            ).first()
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Get league by ID
            league = session.exec(
                select(Leagues).where(Leagues.id == league_id)
            ).first()
            
            if not league:
                raise HTTPException(status_code=404, detail="League not found")
            
            # Verify user is a participant in this league
            user_membership = session.exec(
                select(UserLeagueLink).where(
                    UserLeagueLink.league_id == league_id,
                    UserLeagueLink.user_id == user.id,
                    UserLeagueLink.is_active == True
                )
            ).first()
            
            if not user_membership:
                raise HTTPException(status_code=403, detail="Access denied: You are not a member of this league")
            
            # Count current participants
            participants_count = session.exec(
                select(UserLeagueLink).where(
                    UserLeagueLink.league_id == league_id,
                    UserLeagueLink.is_active == True
                )
            ).fetchall()
            
            return LeagueResponse(
                id=league.id,
                name=league.name,
                description=league.description,
                admin_user_id=league.admin_user_id,
                is_active=league.is_active,
                join_code=league.join_code,
                current_participants=len(participants_count),
                created_at=league.created_at
            )
            
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching league: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.delete("/leagues/{league_id}/leave")
async def leave_league(league_id: int, user_id: str):
    """
    Remove user from a league (leave league)
    """
    try:
        with Session(engine) as session:
            user = session.exec(
                select(Users).where(Users.supabase_user_id == user_id)
            ).first()
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            league = session.exec(
                select(Leagues).where(Leagues.id == league_id)
            ).first()
            
            if not league:
                raise HTTPException(status_code=404, detail="League not found")
            
            user_membership = session.exec(
                select(UserLeagueLink).where(
                    UserLeagueLink.league_id == league_id,
                    UserLeagueLink.user_id == user.id,
                    UserLeagueLink.is_active == True
                )
            ).first()
            
            if not user_membership:
                raise HTTPException(status_code=404, detail="User is not a member of this league")
            
            user_membership.is_active = False
            session.add(user_membership)
            
            # Hard delete user's team in this league
            user_team = session.exec(
                select(UserTeams).where(
                    UserTeams.user_id == user.id,
                    UserTeams.league_id == league_id,
                    UserTeams.is_active == True
                )
            ).first()
            
            if user_team:
                session.delete(user_team)
                logging.info(f"Deleted team '{user_team.team_name}' for user {user.id} in league {league_id}")
            
            session.commit()
            
            return {"message": f"Successfully left league '{league.name}'", "league_id": league_id}
            
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error leaving league: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/leagues/user/{user_id}", response_model=List[LeagueResponse])
async def get_user_leagues(user_id: str):
    """
    Get all leagues where the user is a participant
    """
    try:
        with Session(engine) as session:
            # Verify user exists by supabase_user_id
            user = session.exec(
                select(Users).where(Users.supabase_user_id == user_id)
            ).first()
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Get leagues where user is a participant using the numeric user id
            leagues_query = (
                select(Leagues, UserLeagueLink)
                .join(UserLeagueLink, Leagues.id == UserLeagueLink.league_id)
                .where(
                    UserLeagueLink.user_id == user.id,
                    UserLeagueLink.is_active == True,
                    Leagues.is_active == True
                )
            )
            
            leagues_data = session.exec(leagues_query).all()
            
            # Build response with current participants count
            response_leagues = []
            for league, _ in leagues_data:
                # Count current participants
                participants_count = session.exec(
                    select(UserLeagueLink)
                    .where(
                        UserLeagueLink.league_id == league.id,
                        UserLeagueLink.is_active == True
                    )
                ).fetchall()
                
                response_leagues.append(LeagueResponse(
                    id=league.id,
                    name=league.name,
                    description=league.description,
                    admin_user_id=league.admin_user_id,
                    is_active=league.is_active,
                    join_code=league.join_code,
                    current_participants=len(participants_count),
                    created_at=league.created_at
                ))
            
            return response_leagues
            
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching user leagues: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/leagues/join/")
async def join_league(league_join: LeagueJoin, user_id: str):
    """
    Join a league using join code
    """
    try:
        with Session(engine) as session:
            # Verify user exists by supabase_user_id
            user = session.exec(
                select(Users).where(Users.supabase_user_id == user_id)
            ).first()
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Find league by join code
            league = session.exec(
                select(Leagues).where(
                    Leagues.join_code == league_join.join_code,
                    Leagues.is_active == True
                )
            ).first()
            
            if not league:
                raise HTTPException(status_code=404, detail="League not found or inactive")
            
            # Check if user is already a member
            existing_membership = session.exec(
                select(UserLeagueLink).where(
                    UserLeagueLink.user_id == user.id,
                    UserLeagueLink.league_id == league.id
                )
            ).first()
            
            if existing_membership:
                if existing_membership.is_active:
                    raise HTTPException(status_code=409, detail="User is already a member of this league")
                else:
                    # Reactivate membership
                    existing_membership.is_active = True
                    session.add(existing_membership)
                    session.commit()
                    return {"message": "Successfully rejoined league", "league_id": league.id}
            
            # Add user to league using the numeric user id
            new_membership = UserLeagueLink(
                user_id=user.id,
                league_id=league.id,
                is_admin=False,
                is_active=True
            )
            
            session.add(new_membership)
            session.commit()
            
            return {"message": "Successfully joined league", "league_id": league.id}
            
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error joining league: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/leagues/{league_id}/participants")
async def get_league_participants(league_id: int):
    """
    Get all participants of a specific league
    """
    try:
        with Session(engine) as session:
            # Verify league exists
            league = session.exec(
                select(Leagues).where(
                    Leagues.id == league_id,
                    Leagues.is_active == True
                )
            ).first()
            
            if not league:
                raise HTTPException(status_code=404, detail="League not found")
            
            # Get participants with user details
            participants_query = (
                select(Users, UserLeagueLink)
                .join(UserLeagueLink, Users.id == UserLeagueLink.user_id)
                .where(
                    UserLeagueLink.league_id == league_id,
                    UserLeagueLink.is_active == True
                )
            )
            
            participants_data = session.exec(participants_query).all()
            
            # Build response
            participants = []
            for user, link in participants_data:
                participants.append({
                    "user_id": user.id,
                    "user_name": user.user_name,
                    "email": user.email,
                    "is_admin": link.is_admin,
                    "joined_at": link.joined_at
                })
            
            return {
                "league_id": league_id,
                "league_name": league.name,
                "participants": participants,
                "total_participants": len(participants)
            }
            
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching league participants: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

# ========== USER TEAMS ENDPOINTS ==========

@app.post("/leagues/{league_id}/teams", response_model=UserTeamResponse)
async def create_or_update_user_team(
    league_id: int, 
    team_data: UserTeamUpdate, 
    user_id: str
):
    """
    Create or update a user's team in a specific league
    """
    try:
        with Session(engine) as session:
            # Verify user exists
            user = session.exec(
                select(Users).where(Users.supabase_user_id == user_id)
            ).first()
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Verify user is a member of this league
            membership = session.exec(
                select(UserLeagueLink).where(
                    UserLeagueLink.league_id == league_id,
                    UserLeagueLink.user_id == user.id,
                    UserLeagueLink.is_active == True
                )
            ).first()
            
            if not membership:
                raise HTTPException(status_code=403, detail="Access denied: You are not a member of this league")
            
            # Validate drivers are unique
            driver_ids = [team_data.driver_1_id, team_data.driver_2_id, team_data.driver_3_id]
            if len(set(driver_ids)) != 3:
                raise HTTPException(status_code=400, detail="All drivers must be unique")
            
            # Check if user already has a team in this league
            existing_team = session.exec(
                select(UserTeams).where(
                    UserTeams.user_id == user.id,
                    UserTeams.league_id == league_id,
                    UserTeams.is_active == True
                )
            ).first()
            
            if existing_team:
                # Update existing team
                existing_team.team_name = team_data.team_name
                existing_team.driver_1_id = team_data.driver_1_id
                existing_team.driver_2_id = team_data.driver_2_id
                existing_team.driver_3_id = team_data.driver_3_id
                existing_team.constructor_id = team_data.constructor_id
                existing_team.updated_at = datetime.now()
                
                session.add(existing_team)
                session.commit()
                session.refresh(existing_team)
                
                return existing_team
            else:
                # Create new team
                new_team = UserTeams(
                    user_id=user.id,
                    league_id=league_id,
                    team_name=team_data.team_name,
                    driver_1_id=team_data.driver_1_id,
                    driver_2_id=team_data.driver_2_id,
                    driver_3_id=team_data.driver_3_id,
                    constructor_id=team_data.constructor_id,
                    total_points=0,
                    budget_remaining=100_000_000,
                    is_active=True
                )
                
                session.add(new_team)
                session.commit()
                session.refresh(new_team)
                
                return new_team
                
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating/updating user team: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.get("/leagues/{league_id}/teams/me", response_model=UserTeamResponse | None)
async def get_my_team(league_id: int, user_id: str):
    """
    Get the current user's team in a specific league
    """
    try:
        with Session(engine) as session:
            # Verify user exists
            user = session.exec(
                select(Users).where(Users.supabase_user_id == user_id)
            ).first()
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Verify user is a member of this league
            membership = session.exec(
                select(UserLeagueLink).where(
                    UserLeagueLink.league_id == league_id,
                    UserLeagueLink.user_id == user.id,
                    UserLeagueLink.is_active == True
                )
            ).first()
            
            if not membership:
                raise HTTPException(status_code=403, detail="Access denied: You are not a member of this league")
            
            # Get user's team in this league
            team = session.exec(
                select(UserTeams).where(
                    UserTeams.user_id == user.id,
                    UserTeams.league_id == league_id,
                    UserTeams.is_active == True
                )
            ).first()
            
            return team
            
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error fetching user team: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")