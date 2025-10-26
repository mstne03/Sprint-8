"""User controller module for user-related operations"""
from sqlmodel import Session
from fastapi import HTTPException
from f1_api.controllers.base_controller import BaseController
from f1_api.models.app_models import UserCreate, UserResponse
from f1_api.models.repositories.users_repository import UserRepository

class UserController(BaseController):
    def __init__(self, session: Session):
        super().__init__(session)
        self.repository = UserRepository(session)

    def create_user(self, user: UserCreate) -> UserResponse:
        """
        Create a new user with Supabase integration
        
        Args:
            user: UserCreate object with user data
            
        Returns:
            UserResponse: Created user data
            
        Raises:
            HTTPException: If user already exists or other errors occur
        """
        existing = self.repository.get_existing_user(user)
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Username, email, or Supabase user already registered"
            )
        new_user = self.repository.create_user(user)
        return UserResponse(
            id=new_user.id,
            user_name=new_user.user_name,
            email=new_user.email,
            is_verified=new_user.is_verified,
            created_at=new_user.created_at
        )

def create_user_service(user: UserCreate, session: Session) -> UserResponse:
    with UserController(session) as controller:
        return controller.create_user(user)