"""Teams-related routes"""
from fastapi import APIRouter, Depends
from sqlmodel import Session
from f1_api.controllers.teams_controller import TeamsController
from f1_api.dependencies import get_db_session

router = APIRouter(prefix="/teams", tags=["teams"])

@router.get("/")
def get_teams(session: Session = Depends(get_db_session)):
    """Get all teams for the current season with accumulated points"""
    with TeamsController(session) as controller:
        return controller.get_teams_with_season_stats
