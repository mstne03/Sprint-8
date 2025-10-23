"""Users-related routes"""
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from f1_api.controllers.user_controller import UserController
from f1_api.controllers.user_teams_controller_new import get_my_teams_service
from f1_api.dependencies import get_db_session
from f1_api.models.app_models import (
    UserCreate, UserResponse, Users
)

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserResponse)
def create_user(
    user: UserCreate,
    session: Session = Depends(get_db_session)
):
    """Create a new user with Supabase integration"""
    with UserController(session) as controller:
        return controller.create_user(user)


@router.get("/by-id/{supabase_user_id}")
def get_user_by_id(
    supabase_user_id: str,
    session: Session = Depends(get_db_session)
):
    """Get the user from the database by Supabase ID"""
    user = session.exec(
        select(Users).where(Users.supabase_user_id == supabase_user_id)
    ).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return {"data": user}


@router.get("/my-teams")
def get_my_teams(
    user_id: str,
    session: Session = Depends(get_db_session)
):
    """Get all teams belonging to the current user across all leagues"""
    return get_my_teams_service(user_id, session)