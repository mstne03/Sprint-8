"""User Teams controller - HTTP handlers for user teams endpoints"""
from typing import List, Optional
from fastapi import HTTPException
from sqlmodel import Session
from f1_api.models.app_models import UserTeamsCreate, UserTeamUpdate, UserTeamResponse
from f1_api.models.business.user_teams_model import UserTeamsModel


class UserTeamsController:
    """HTTP controller for user teams endpoints"""
    
    def __init__(self):
        self.user_teams_model = UserTeamsModel()
    
    async def create_user_team(self, user_team: UserTeamsCreate, session: Session) -> dict:
        """
        HTTP handler for POST /user-team/ endpoint
        
        Args:
            user_team: User team creation data
            session: Database session
            
        Returns:
            Success message
            
        Raises:
            HTTPException: If error occurs
        """
        try:
            return self.user_teams_model.create_user_team(user_team, session)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error creating user team: {str(e)}") from e
    
    async def create_or_update_user_team(
        self, 
        league_id: int, 
        team_data: UserTeamUpdate, 
        user_id: str, 
        session: Session
    ) -> UserTeamResponse:
        """
        HTTP handler for POST /leagues/{league_id}/teams endpoint
        
        Args:
            league_id: League ID
            team_data: Team update data
            user_id: User ID
            session: Database session
            
        Returns:
            User team data
            
        Raises:
            HTTPException: If error occurs
        """
        try:
            return self.user_teams_model.create_or_update_user_team(league_id, team_data, user_id, session)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error creating/updating user team: {str(e)}") from e
    
    async def get_my_team(self, league_id: int, user_id: str, session: Session) -> Optional[UserTeamResponse]:
        """
        HTTP handler for GET /leagues/{league_id}/teams/me endpoint
        
        Args:
            league_id: League ID
            user_id: User ID
            session: Database session
            
        Returns:
            User team data or None
            
        Raises:
            HTTPException: If error occurs
        """
        try:
            return self.user_teams_model.get_my_team(league_id, user_id, session)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching user team: {str(e)}") from e
    
    async def get_my_teams(self, user_id: str, session: Session) -> List[dict]:
        """
        HTTP handler for GET /users/my-teams endpoint
        
        Args:
            user_id: User ID
            session: Database session
            
        Returns:
            List of user's teams
            
        Raises:
            HTTPException: If error occurs
        """
        try:
            return self.user_teams_model.get_my_teams(user_id, session)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching user teams: {str(e)}") from e


# Global instance
user_teams_controller = UserTeamsController()