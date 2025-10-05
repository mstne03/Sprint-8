"""Drivers service module for drivers-related operations"""
import logging
from sqlmodel import Session
from ..season.utils.driver_calc import get_database_data, get_driver_stats, get_drivers_mapped


def get_drivers_service(session: Session) -> list:
    """
    Get all drivers sorted by championship points up to the last round
    
    Args:
        session: Database session
        
    Returns:
        list: Drivers with calculated points and stats
    """
    try:
        database_data = get_database_data(session)
        max_round = database_data["max_round"]
        sprint_rounds = database_data["sprint_rounds"]
        results = database_data["results"]
        all_results = database_data["all_results"]
        db_drivers = database_data["drivers"]

        points_map = {r.driver_id: r.total_points for r in results}

        available_points = 25 * max_round + len(sprint_rounds) * 8

        stats = get_driver_stats(all_results)
        
        drivers_sorted = sorted(
            db_drivers,
            key=lambda d: points_map.get(d.id, 0),
            reverse=True
        )

        drivers = get_drivers_mapped(max_round, stats, points_map, available_points, drivers_sorted, session)

        return drivers
        
    except Exception as e:  # pylint: disable=broad-except
        logging.warning("Drivers service execution interrupted by the following exception: %s", e)
        return []