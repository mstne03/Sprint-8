"""Teams controller - HTTP handlers for teams endpoints"""
from typing import List, Dict, Any
from fastapi import HTTPException
from sqlmodel import Session
from f1_api.models.business.teams_model import TeamsModel


class TeamsController:
    """HTTP controller for teams endpoints"""
    
    def __init__(self):
        self.teams_model = TeamsModel()
    
    async def get_teams(self, session: Session) -> List[Dict[str, Any]]:
        """
        HTTP handler for GET /teams/ endpoint
        
        Args:
            session: Database session
            
        Returns:
            Teams data with points
            
        Raises:
            HTTPException: If error occurs
        """
        try:
            return self.teams_model.get_all_teams_with_points(session)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching teams: {str(e)}") from e


# Global instance
teams_controller = TeamsController()