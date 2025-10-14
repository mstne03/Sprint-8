"""User controller module for user-related operations"""
from sqlmodel import Session
from fastapi import HTTPException
from f1_api.models.app_models import UserCreate, UserResponse
from f1_api.models.repositories.users_repository import UserRepository

class UserController:
    def __init__(self, session: Session, user: UserCreate):
        self.repository = UserRepository(session)
        self.user = user

    @property
    def new_user(self):
        """
        Create a new user with Supabase integration
        
        Args:
            user: UserCreate object with user data
            session: Database session
            
        Returns:
            UserResponse: Created user data
            
        Raises:
            HTTPException: If user already exists or other errors occur
        """
        existing = self.repository.get_existing_user(self.user)
        if existing:
            raise HTTPException(
                status_code=400,
                detail="Username, email, or Supabase self.user already registered"
            )
        new_user = self.repository.create_user(self.user)
        return UserResponse(
            id=new_user.id,
            user_name=new_user.user_name,
            email=new_user.email,
            is_verified=new_user.is_verified,
            created_at=new_user.created_at
        )

def create_user_service(user: UserCreate, session: Session) -> UserResponse:
    controller = UserController(session, user)
    return controller.new_user