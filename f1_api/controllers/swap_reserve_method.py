    
from datetime import datetime
from fastapi import HTTPException
from sqlalchemy import select
from f1_api.models.app_models import UserTeams


def swap_reserve_driver(self, user_id: int, driver_id: int, league_id: int) -> dict:
    """
    Swap a main driver with the reserve driver.
    The specified driver_id will become the reserve, and the current reserve will take its slot.
    
    Args:
        user_id: Internal user ID
        driver_id: ID of the driver to make reserve (currently in slot 1, 2, or 3)
        league_id: League ID
        
    Returns:
        dict with updated team configuration
    """
    # Get user's team
    team = self.session.exec(
        select(UserTeams).where(
            UserTeams.user_id == user_id,
            UserTeams.league_id == league_id,
            UserTeams.is_active == True
        )
    ).first()
    
    if not team:
        raise HTTPException(404, "Team not found")
    
    # Find which slot the driver is in
    current_reserve = team.reserve_driver_id
    driver_slot = None
    
    if team.driver_1_id == driver_id:
        driver_slot = 1
    elif team.driver_2_id == driver_id:
        driver_slot = 2
    elif team.driver_3_id == driver_id:
        driver_slot = 3
    elif team.reserve_driver_id == driver_id:
        # Driver is already reserve, no swap needed
        raise HTTPException(400, "Driver is already in reserve position")
    else:
        raise HTTPException(400, "Driver not found in team")
    
    # Swap drivers
    if driver_slot == 1:
        team.driver_1_id = current_reserve
    elif driver_slot == 2:
        team.driver_2_id = current_reserve
    elif driver_slot == 3:
        team.driver_3_id = current_reserve
    
    team.reserve_driver_id = driver_id
    team.updated_at = datetime.now()
    
    # Changes will be committed by BaseController.__exit__
    
    return {
        "success": True,
        "message": "Reserve driver swapped successfully",
        "team": {
            "driver_1_id": team.driver_1_id,
            "driver_2_id": team.driver_2_id,
            "driver_3_id": team.driver_3_id,
            "reserve_driver_id": team.reserve_driver_id
        }
    }
