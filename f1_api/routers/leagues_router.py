"""League-related routes"""
from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session
from f1_api.controllers.league_controller import LeagueController
from f1_api.controllers.user_teams_controller_new import UserTeamsController
from f1_api.dependencies import get_db_session
from f1_api.models.app_models import (
    LeagueCreate, LeagueResponse, LeagueJoin, UserTeamUpdate, UserTeamResponse
)

router = APIRouter(prefix="/leagues", tags=["leagues"])

@router.post("/", response_model=LeagueResponse)
def create_league(
    league: LeagueCreate,
    admin_user_id: str,
    session: Session = Depends(get_db_session)
):
    """Create a new league and automatically add the creator as admin"""
    with LeagueController(session) as controller:
        return controller.create_league(admin_user_id, league)


@router.get("/{league_id}", response_model=LeagueResponse)
def get_league_by_id(
    league_id: int,
    user_id: str,
    session: Session = Depends(get_db_session)
):
    """Get details of a specific league by ID - only for league participants"""
    with LeagueController(session) as controller:
        return controller.get_league_by_id(league_id, user_id)


@router.delete("/{league_id}/leave")
def leave_league(
    league_id: int,
    user_id: str,
    session: Session = Depends(get_db_session)
):
    """Remove user from a league (leave league)"""
    with LeagueController(session) as controller:
        return controller.leave_league(league_id, user_id)


@router.get("/user/{user_id}", response_model=List[LeagueResponse])
def get_user_leagues(
    user_id: str,
    session: Session = Depends(get_db_session)
):
    """Get all leagues where the user is a participant"""
    with LeagueController(session) as controller:
        return controller.get_user_leagues(user_id)


@router.post("/join/")
def join_league(
    league_join: LeagueJoin,
    user_id: str,
    session: Session = Depends(get_db_session)
):
    """Join a league using join code"""
    with LeagueController(session) as controller:
        return controller.join_league(league_join, user_id)


@router.get("/{league_id}/participants")
def get_league_participants(
    league_id: int,
    session: Session = Depends(get_db_session)
):
    """Get all participants of a specific league"""
    with LeagueController(session) as controller:
        return controller.get_league_participants(league_id)


@router.post("/{league_id}/teams", response_model=UserTeamResponse)
def create_or_update_user_team(
    league_id: int,
    team_data: UserTeamUpdate,
    user_id: str,
    session: Session = Depends(get_db_session)
):
    """Create or update a user's team in a specific league"""
    with UserTeamsController(session) as controller:
        return controller.create_or_update_team(league_id, team_data, user_id)


@router.get("/{league_id}/teams/me", response_model=UserTeamResponse | None)
def get_my_team(
    league_id: int,
    user_id: str,
    session: Session = Depends(get_db_session)
):
    """Get the current user's team in a specific league"""
    with UserTeamsController(session) as controller:
        return controller.get_my_team(league_id, user_id)
