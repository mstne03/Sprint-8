"""In this module the api exposes the endpoints"""
from typing import List
from sqlmodel import Session
import fastf1 as ff1
from fastapi.middleware.cors import CORSMiddleware
# Import controllers instead of services
from f1_api.controllers.season_controller import season_controller
from f1_api.controllers.teams_controller import teams_controller
from f1_api.controllers.drivers_controller import drivers_controller
from f1_api.controllers.users_controller import users_controller
from f1_api.controllers.leagues_controller import leagues_controller
from f1_api.controllers.user_teams_controller import user_teams_controller
from .config.sql_init import engine
from .app import app
from .models.app_models import (
    UserTeamsCreate, UserCreate, 
    UserResponse, LeagueCreate, 
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
    return await season_controller.update_season()

@app.get("/teams/")
async def get_teams():
    """
    This endpoint gets all of the teams for the current season from the DB with accumulated points
    """
    with Session(engine) as session:
        return await teams_controller.get_teams(session)

@app.get("/drivers/")
async def get_drivers():
    """
    Returns all drivers sorted by championship points up to the last round
    """
    with Session(engine) as session:
        return await drivers_controller.get_drivers(session)

@app.post("/users/", response_model=UserResponse)
async def create_user(user: UserCreate):
    """
    Create a new user with Supabase integration
    """
    with Session(engine) as session:
        return await users_controller.create_user(user, session)

@app.post("/user-team/")
async def create_user_team(user_team: UserTeamsCreate):
    """
    Post a new user team into the database
    """
    with Session(engine) as session:
        return await user_teams_controller.create_user_team(user_team, session)
    
@app.get("/users/by-id/{supabase_user_id}")
async def get_user_by_id(supabase_user_id: str):
    """
    Get the user from the DB
    """
    with Session(engine) as session:
        return await users_controller.get_user_by_id(supabase_user_id, session)

@app.post("/leagues/", response_model=LeagueResponse)
async def create_league(league: LeagueCreate, admin_user_id: str):
    """
    Create a new league and automatically add the creator as admin
    """
    with Session(engine) as session:
        return await leagues_controller.create_league(league, admin_user_id, session)

@app.get("/leagues/{league_id}", response_model=LeagueResponse)
async def get_league_by_id(league_id: int, user_id: str):
    """
    Get details of a specific league by ID - only for league participants
    """
    with Session(engine) as session:
        return await leagues_controller.get_league_by_id(league_id, user_id, session)

@app.delete("/leagues/{league_id}/leave")
async def leave_league(league_id: int, user_id: str):
    """
    Remove user from a league (leave league)
    """
    with Session(engine) as session:
        return await leagues_controller.leave_league(league_id, user_id, session)

@app.get("/leagues/user/{user_id}", response_model=List[LeagueResponse])
async def get_user_leagues(user_id: str):
    """
    Get all leagues where the user is a participant
    """
    with Session(engine) as session:
        return await leagues_controller.get_user_leagues(user_id, session)

@app.post("/leagues/join/")
async def join_league(league_join: LeagueJoin, user_id: str):
    """
    Join a league using join code
    """
    with Session(engine) as session:
        return await leagues_controller.join_league(league_join, user_id, session)

@app.get("/leagues/{league_id}/participants")
async def get_league_participants(league_id: int):
    """
    Get all participants of a specific league
    """
    with Session(engine) as session:
        return await leagues_controller.get_league_participants(league_id, session)

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
        return await user_teams_controller.create_or_update_user_team(league_id, team_data, user_id, session)

@app.get("/leagues/{league_id}/teams/me", response_model=UserTeamResponse | None)
async def get_my_team(league_id: int, user_id: str):
    """
    Get the current user's team in a specific league
    """
    with Session(engine) as session:
        return await user_teams_controller.get_my_team(league_id, user_id, session)

@app.get("/users/my-teams")
async def get_my_teams(user_id: str):
    """
    Get all teams belonging to the current user across all leagues
    """
    with Session(engine) as session:
        return await user_teams_controller.get_my_teams(user_id, session)