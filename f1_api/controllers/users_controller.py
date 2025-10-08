"""Users controller - HTTP handlers for users endpoints"""
from fastapi import HTTPException
from sqlmodel import Session
from f1_api.models.app_models import UserCreate, UserResponse
from f1_api.models.business.users_model import UsersModel


class UsersController:
    """HTTP controller for users endpoints"""
    
    def __init__(self):
        self.users_model = UsersModel()
    
    async def create_user(self, user: UserCreate, session: Session) -> UserResponse:
        """
        HTTP handler for POST /users/ endpoint
        
        Args:
            user: User creation data
            session: Database session
            
        Returns:
            Created user data
            
        Raises:
            HTTPException: If error occurs
        """
        try:
            return self.users_model.create_user(user, session)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error creating user: {str(e)}") from e
    
    async def get_user_by_id(self, supabase_user_id: str, session: Session) -> dict:
        """
        HTTP handler for GET /users/by-id/{supabase_user_id} endpoint
        
        Args:
            supabase_user_id: Supabase user ID
            session: Database session
            
        Returns:
            User data
            
        Raises:
            HTTPException: If user not found or error occurs
        """
        try:
            user = self.users_model.get_user_by_supabase_id(supabase_user_id, session)
            if not user:
                raise HTTPException(status_code=400, detail="User not found")
            return {"data": user}
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching user: {str(e)}") from e


# Global instance
users_controller = UsersController()