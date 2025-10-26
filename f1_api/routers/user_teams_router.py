"""User Teams-related routes"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
import logging

from f1_api.controllers.user_teams_controller_new import UserTeamsController
from f1_api.dependencies import get_db_session
from f1_api.models.app_models import (
    UserTeamsCreate, UserTeams, UserTeamUpdate, UserTeamResponse
)

router = APIRouter(prefix="/user-teams", tags=["user-teams"])


@router.post("/")
def create_user_team(
    user_team: UserTeamsCreate,
    session: Session = Depends(get_db_session)
):
    """Create a basic user team in the database"""
    try:
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
        return {"message": "User team created successfully"}
    except Exception as e:
        session.rollback()
        logging.error("Error creating user team: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error") from e


@router.post("/leagues/{league_id}/teams", response_model=UserTeamResponse)
def create_or_update_user_team(
    league_id: int,
    team_data: UserTeamUpdate,
    user_id: str,
    session: Session = Depends(get_db_session)
):
    """Create or update a user's team in a specific league"""
    with UserTeamsController(session) as controller:
        return controller.create_or_update_team(league_id, team_data, user_id)


@router.get("/leagues/{league_id}/teams/me", response_model=UserTeamResponse | None)
def get_my_team(
    league_id: int,
    user_id: str,
    session: Session = Depends(get_db_session)
):
    """Get the current user's team in a specific league"""
    with UserTeamsController(session) as controller:
        return controller.get_my_team(league_id, user_id)