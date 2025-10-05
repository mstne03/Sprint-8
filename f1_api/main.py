"""In this module the api exposes the endpoints"""
import logging
from typing import List
from sqlmodel import select, Session
import fastf1 as ff1
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from f1_api.services.user_service import create_user_service
from f1_api.services.teams_service import get_teams_service
from f1_api.services.drivers_service import get_drivers_service
from f1_api.services.league_service import create_league_service, get_league_by_id_service, leave_league_service, get_user_leagues_service, join_league_service, get_league_participants_service
from f1_api.services.user_teams_service import create_or_update_user_team_service, get_my_team_service, get_my_teams_service
from .config.sql_init import engine
from .season.update_db import update_db
from .app import app
from .models.app_models import (
    UserTeamsCreate, Users, UserCreate, 
    UserResponse, UserTeams, LeagueCreate, 
    LeagueResponse, LeagueJoin,
    UserTeamUpdate, UserTeamResponse
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ff1.Cache.enable_cache(r'C:/Users/Marc/Documents/ITA/Sprint 8/f1_api/ff1_cache')

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
    This endpoint gets all of the teams for the current season from the DB with accumulated points
    """
    with Session(engine) as session:
        return get_teams_service(session)

@app.get("/drivers/")
async def get_drivers():
    """
    Returns all drivers sorted by championship points up to the last round
    """
    with Session(engine) as session:
        return get_drivers_service(session)

@app.post("/users/", response_model=UserResponse)
async def create_user(user: UserCreate):
    """
    Create a new user with Supabase integration
    """
    with Session(engine) as session:
        return create_user_service(user, session)

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
    """
    Get the user from the DB
    """
    with Session(engine) as session:
        user = session.exec(
            select(Users).where(Users.supabase_user_id == supabase_user_id)
        ).first()

        if not user:
            raise HTTPException(status_code=400, detail="User not found")
        return { "data": user }

@app.post("/leagues/", response_model=LeagueResponse)
async def create_league(league: LeagueCreate, admin_user_id: str):
    """
    Create a new league and automatically add the creator as admin
    """
    with Session(engine) as session:
        return create_league_service(league, admin_user_id, session)

@app.get("/leagues/{league_id}", response_model=LeagueResponse)
async def get_league_by_id(league_id: int, user_id: str):
    """
    Get details of a specific league by ID - only for league participants
    """
    with Session(engine) as session:
        return get_league_by_id_service(league_id, user_id, session)

@app.delete("/leagues/{league_id}/leave")
async def leave_league(league_id: int, user_id: str):
    """
    Remove user from a league (leave league)
    """
    with Session(engine) as session:
        return leave_league_service(league_id, user_id, session)

@app.get("/leagues/user/{user_id}", response_model=List[LeagueResponse])
async def get_user_leagues(user_id: str):
    """
    Get all leagues where the user is a participant
    """
    with Session(engine) as session:
        return get_user_leagues_service(user_id, session)

@app.post("/leagues/join/")
async def join_league(league_join: LeagueJoin, user_id: str):
    """
    Join a league using join code
    """
    with Session(engine) as session:
        return join_league_service(league_join, user_id, session)

@app.get("/leagues/{league_id}/participants")
async def get_league_participants(league_id: int):
    """
    Get all participants of a specific league
    """
    with Session(engine) as session:
        return get_league_participants_service(league_id, session)

@app.post("/leagues/{league_id}/teams", response_model=UserTeamResponse)
async def create_or_update_user_team(
    league_id: int, 
    team_data: UserTeamUpdate, 
    user_id: str
):
    """
    Create or update a user's team in a specific league
    """
    with Session(engine) as session:
        return create_or_update_user_team_service(league_id, team_data, user_id, session)

@app.get("/leagues/{league_id}/teams/me", response_model=UserTeamResponse | None)
async def get_my_team(league_id: int, user_id: str):
    """
    Get the current user's team in a specific league
    """
    with Session(engine) as session:
        return get_my_team_service(league_id, user_id, session)

@app.get("/users/my-teams")
async def get_my_teams(user_id: str):
    """
    Get all teams belonging to the current user across all leagues
    """
    with Session(engine) as session:
        return get_my_teams_service(user_id, session)