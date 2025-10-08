"""Season controller - HTTP handlers for season endpoints"""
from fastapi import HTTPException
from f1_api.models.business.season_model import SeasonModel


class SeasonController:
    """HTTP controller for season endpoints"""
    
    def __init__(self):
        self.season_model = SeasonModel()
    
    async def update_season(self) -> dict:
        """
        HTTP handler for POST /season/ endpoint
        
        Returns:
            Success status
            
        Raises:
            HTTPException: If error occurs
        """
        try:
            return self.season_model.update_season()
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error updating season: {str(e)}") from e


# Global instance
season_controller = SeasonController()