"""Teams service module for teams-related operations"""
import logging
from sqlmodel import Session
from ..season.utils.driver_calc import get_database_data, get_teams_mapped


def get_teams_service(session: Session) -> list:
    """
    Get all teams for the current season from the DB with accumulated points
    
    Args:
        session: Database session
        
    Returns:
        list: Teams with calculated points
    """
    try:
        # Get database data including points calculation
        database_data = get_database_data(session)
        max_round = database_data["max_round"]
        results = database_data["results"]
        
        # Create points mapping from driver results
        points_map = {result.driver_id: result.total_points for result in results}
        
        # Get teams with calculated points
        teams_mapped = get_teams_mapped(max_round, points_map, session)
        
        return teams_mapped
        
    except Exception as e:  # pylint: disable=broad-except
        logging.warning("Teams service execution interrupted by the following exception: %s", e)
        return []