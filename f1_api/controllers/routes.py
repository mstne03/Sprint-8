"""Routes"""
import logging
from typing import List
from fastapi import APIRouter
from fastapi import HTTPException
from sqlmodel import select, Session
from f1_api.controllers.database_controller import update_db
from f1_api.controllers.user_controller import create_user_service
from f1_api.controllers.teams_controller import get_teams_service
from f1_api.controllers.drivers_controller import get_drivers_service
from f1_api.controllers.league_controller import (
    create_league_service, get_league_by_id_service,
    leave_league_service, get_user_leagues_service,
    join_league_service, get_league_participants_service
)
from f1_api.controllers.user_teams_controller import (
    create_or_update_user_team_service, get_my_team_service,
    get_my_teams_service
)
from f1_api.config.sql_init import engine
from f1_api.models.app_models import (
    UserTeamsCreate, Users, UserCreate,
    UserResponse, UserTeams, LeagueCreate,
    LeagueResponse, LeagueJoin,
    UserTeamUpdate, UserTeamResponse
)

router = APIRouter()

@router.post("/legacy/season/")
async def update_season():
    """
    This endpoint posts all data for the current season into the DB
    """
    await update_db(engine)
    return {"status": "updated"}

@router.get("/legacy/teams/")
def get_teams():
    """
    This endpoint gets all of the teams for the current season from the DB with accumulated points
    """
    with Session(engine) as session:
        return get_teams_service(session)

@router.get("/legacy/drivers/")
def get_drivers():
    """
    Returns all drivers sorted by championship points up to the last round
    """
    with Session(engine) as session:
        return get_drivers_service(session)

@router.post("/legacy/users/", response_model=UserResponse)
def create_user(user: UserCreate):
    """
    Create a new user with Supabase integration
    """
    with Session(engine) as session:
        return create_user_service(user, session)

@router.post("/legacy/user-team/")
def create_user_team(user_team: UserTeamsCreate):
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
    
@router.get("/legacy/users/by-id/{supabase_user_id}")
def get_user_by_id(supabase_user_id: str):
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

@router.post("/legacy/leagues/", response_model=LeagueResponse)
def create_league(league: LeagueCreate, admin_user_id: str):
    """
    Create a new league and automatically add the creator as admin
    """
    with Session(engine) as session:
        return create_league_service(league, admin_user_id, session)

@router.get("/legacy/leagues/{league_id}", response_model=LeagueResponse)
def get_league_by_id(league_id: int, user_id: str):
    """
    Get details of a specific league by ID - only for league participants
    """
    with Session(engine) as session:
        return get_league_by_id_service(league_id, user_id, session)

@router.delete("/legacy/leagcy/leagues/{league_id}/leave")
def leave_league(league_id: int, user_id: str):
    """
    Remove user from a league (leave league)
    """
    with Session(engine) as session:
        return leave_league_service(league_id, user_id, session)

@router.get("/legacy/legacy/leagues/user/{user_id}", response_model=List[LeagueResponse])
def get_user_leagues(user_id: str):
    """
    Get all leagues where the user is a participant
    """
    with Session(engine) as session:
        try:
            return get_user_leagues_service(user_id, session)
        except Exception as e:
            logging.exception(f"An exception occured in get_user_leagues method: {e}")

@router.post("/legacy/leagues/join/")
def join_league(league_join: LeagueJoin, user_id: str):
    """
    Join a league using join code
    """
    with Session(engine) as session:
        return join_league_service(league_join, user_id, session)

@router.get("/legacy/leagues/{league_id}/participants")
def get_league_participants(league_id: int):
    """
    Get all participants of a specific league
    """
    with Session(engine) as session:
        return get_league_participants_service(league_id, session)

@router.post("/legacy/leagues/{league_id}/teams", response_model=UserTeamResponse)
def create_or_update_user_team(
    league_id: int,
    team_data: UserTeamUpdate,
    user_id: str
):
    """
    Create or update a user's team in a specific league
    """
    with Session(engine) as session:
        return create_or_update_user_team_service(league_id, team_data, user_id, session)

@router.get("/legacy/leagues/{league_id}/teams/me", response_model=UserTeamResponse | None)
def get_my_team(league_id: int, user_id: str):
    """
    Get the current user's team in a specific league
    """
    with Session(engine) as session:
        return get_my_team_service(league_id, user_id, session)

@router.get("/legacy/users/my-teams")
def get_my_teams(user_id: str):
    """
    Get all teams belonging to the current user across all leagues
    """
    with Session(engine) as session:
        return get_my_teams_service(user_id, session)
