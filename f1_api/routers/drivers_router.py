"""Drivers-related routes"""
from fastapi import APIRouter, Depends
from sqlmodel import Session

from f1_api.controllers.drivers_controller import DriversController
from f1_api.dependencies import get_db_session

router = APIRouter(prefix="/drivers", tags=["drivers"])


@router.get("/")
def get_drivers(session: Session = Depends(get_db_session)):
    """Get all drivers sorted by championship points up to the last round"""
    with DriversController(session) as controller:
        return controller.get_drivers_service()