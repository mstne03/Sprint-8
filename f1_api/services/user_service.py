"""User service module for user-related operations"""
import logging
from sqlmodel import select, Session
from fastapi import HTTPException
from f1_api.models.app_models import Users, UserCreate, UserResponse


def create_user_service(user: UserCreate, session: Session) -> UserResponse:
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
    try:
        # Check if user already exists
        existing_user = session.exec(
            select(Users).where(
                (Users.user_name == user.user_name) | 
                (Users.email == user.email) |
                (Users.supabase_user_id == user.supabase_user_id)
            )
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Username, email, or Supabase user already registered"
            )
        
        # Create new user
        new_user = Users(
            user_name=user.user_name,
            email=user.email,
            supabase_user_id=user.supabase_user_id,
            is_verified=True
        )
        
        session.add(new_user)
        session.commit()
        session.refresh(new_user)
        
        return UserResponse(
            id=new_user.id,
            user_name=new_user.user_name,
            email=new_user.email,
            is_verified=new_user.is_verified,
            created_at=new_user.created_at
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")