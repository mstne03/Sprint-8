"""Users business model - Contains all users-related business logic and CRUD operations"""
import logging
from typing import Optional, Dict, Any
from sqlmodel import select, Session
from fastapi import HTTPException
from f1_api.models.app_models import Users, UserCreate, UserResponse


class UsersModel:
    """Business model for users operations with all CRUD and business logic"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def create_user(self, user: UserCreate, session: Session) -> UserResponse:
        """
        Create a new user with Supabase integration
        Contains all business logic for user creation and validation
        
        Args:
            user: UserCreate object with user data
            session: Database session
            
        Returns:
            UserResponse: Created user data
            
        Raises:
            HTTPException: If user already exists or other errors occur
        """
        try:
            # Business logic: Check if user already exists
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
            
            # Business logic: Create new user with default values
            new_user = Users(
                user_name=user.user_name,
                email=user.email,
                supabase_user_id=user.supabase_user_id,
                is_verified=True  # Business rule: auto-verify Supabase users
            )
            
            # CRUD operation: Save to database
            session.add(new_user)
            session.commit()
            session.refresh(new_user)
            
            # Business logic: Transform to response format
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
            self.logger.error("Error creating user: %s", e)
            raise HTTPException(status_code=500, detail="Internal server error") from e
    
    def get_user_by_supabase_id(self, supabase_user_id: str, session: Session) -> Optional[Users]:
        """
        Get user by Supabase user ID
        CRUD operation with business logic
        
        Args:
            supabase_user_id: Supabase user ID
            session: Database session
            
        Returns:
            User object or None if not found
        """
        try:
            user = session.exec(
                select(Users).where(Users.supabase_user_id == supabase_user_id)
            ).first()
            
            return user
            
        except Exception as e:
            self.logger.error("Error fetching user by Supabase ID %s: %s", supabase_user_id, e)
            return None
    
    def get_user_by_id(self, user_id: int, session: Session) -> Optional[Users]:
        """
        Get user by internal user ID
        CRUD operation
        
        Args:
            user_id: Internal user ID
            session: Database session
            
        Returns:
            User object or None if not found
        """
        try:
            user = session.exec(
                select(Users).where(Users.id == user_id)
            ).first()
            
            return user
            
        except Exception as e:
            self.logger.error("Error fetching user by ID %s: %s", user_id, e)
            return None
    
    def get_user_by_username(self, username: str, session: Session) -> Optional[Users]:
        """
        Get user by username
        CRUD operation with business logic
        
        Args:
            username: Username to search for
            session: Database session
            
        Returns:
            User object or None if not found
        """
        try:
            user = session.exec(
                select(Users).where(Users.user_name == username)
            ).first()
            
            return user
            
        except Exception as e:
            self.logger.error("Error fetching user by username %s: %s", username, e)
            return None
    
    def update_user_verification(self, user_id: int, is_verified: bool, session: Session) -> bool:
        """
        Update user verification status
        Business logic for user verification
        
        Args:
            user_id: User ID
            is_verified: New verification status
            session: Database session
            
        Returns:
            True if updated successfully, False otherwise
        """
        try:
            user = self.get_user_by_id(user_id, session)
            
            if not user:
                return False
            
            # Business logic: Update verification status
            user.is_verified = is_verified
            session.add(user)
            session.commit()
            
            return True
            
        except Exception as e:
            self.logger.error("Error updating user verification: %s", e)
            return False
    
    def validate_user_exists(self, user_id: str, session: Session) -> bool:
        """
        Validate that a user exists by Supabase ID
        Business logic for user validation
        
        Args:
            user_id: Supabase user ID
            session: Database session
            
        Returns:
            True if user exists, False otherwise
        """
        try:
            user = self.get_user_by_supabase_id(user_id, session)
            return user is not None
            
        except Exception as e:
            self.logger.error("Error validating user existence: %s", e)
            return False
    
    def get_user_profile(self, supabase_user_id: str, session: Session) -> Dict[str, Any]:
        """
        Get comprehensive user profile with related data
        Business logic for user profile aggregation
        
        Args:
            supabase_user_id: Supabase user ID
            session: Database session
            
        Returns:
            User profile with additional information
        """
        try:
            user = self.get_user_by_supabase_id(supabase_user_id, session)
            
            if not user:
                return {}
            
            # Business logic: Build comprehensive profile
            profile = {
                "id": user.id,
                "user_name": user.user_name,
                "email": user.email,
                "is_verified": user.is_verified,
                "created_at": user.created_at,
                "supabase_user_id": user.supabase_user_id
            }
            
            return profile
            
        except Exception as e:
            self.logger.error("Error getting user profile: %s", e)
            return {}