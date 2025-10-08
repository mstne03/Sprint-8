"""Drivers controller - HTTP handlers for drivers endpoints"""
from typing import List, Dict, Any
from fastapi import HTTPException
from sqlmodel import Session
from f1_api.models.business.drivers_model import DriversModel


class DriversController:
    """HTTP controller for drivers endpoints"""
    
    def __init__(self):
        self.drivers_model = DriversModel()
    
    async def get_drivers(self, session: Session) -> List[Dict[str, Any]]:
        """
        HTTP handler for GET /drivers/ endpoint
        
        Args:
            session: Database session
            
        Returns:
            Drivers data sorted by championship points
            
        Raises:
            HTTPException: If error occurs
        """
        try:
            return self.drivers_model.get_all_drivers_with_points(session)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching drivers: {str(e)}") from e


# Global instance
drivers_controller = DriversController()