"""Drivers business model - Contains all drivers-related business logic and CRUD operations"""
import logging
from typing import List, Dict, Any
from sqlmodel import Session
from f1_api.season.utils.ingest import get_database_data, get_driver_stats, get_drivers_mapped


class DriversModel:
    """Business model for drivers operations with all CRUD and business logic"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def get_all_drivers_with_points(self, session: Session) -> List[Dict[str, Any]]:
        """
        Get all drivers sorted by championship points up to the last round
        Contains all business logic for calculating driver statistics and points
        
        Args:
            session: Database session
            
        Returns:
            List of drivers with calculated points and statistics
        """
        try:
            # Get comprehensive database data with business logic
            database_data = get_database_data(session)
            max_round = database_data["max_round"]
            sprint_rounds = database_data["sprint_rounds"]
            results = database_data["results"]
            all_results = database_data["all_results"]
            db_drivers = database_data["drivers"]

            # Calculate points mapping - business logic
            points_map = {r.driver_id: r.total_points for r in results}

            # Calculate available points for the season - business rule
            available_points = 25 * max_round + len(sprint_rounds) * 8

            # Get driver statistics with business logic
            stats = get_driver_stats(all_results)
            
            # Sort drivers by championship points - business rule
            drivers_sorted = sorted(
                db_drivers,
                key=lambda d: points_map.get(d.id, 0),
                reverse=True
            )

            # Apply comprehensive mapping with business logic
            drivers = get_drivers_mapped(max_round, stats, points_map, available_points, drivers_sorted, session)

            return drivers
            
        except Exception as e:
            self.logger.warning("Drivers model execution interrupted: %s", e)
            return []
    
    def get_driver_by_id(self, session: Session, driver_id: int) -> Dict[str, Any]:
        """
        Get specific driver by ID with all related statistics
        CRUD operation with business logic
        
        Args:
            session: Database session
            driver_id: Driver ID
            
        Returns:
            Driver data with comprehensive statistics
        """
        try:
            all_drivers = self.get_all_drivers_with_points(session)
            driver = next((d for d in all_drivers if d.get("id") == driver_id), {})
            
            return driver
            
        except Exception as e:
            self.logger.error("Error fetching driver by ID %s: %s", driver_id, e)
            return {}
    
    def calculate_driver_championship_position(self, session: Session, driver_id: int) -> int:
        """
        Calculate current championship position for a specific driver
        Business logic for championship standings
        
        Args:
            session: Database session
            driver_id: Driver ID
            
        Returns:
            Championship position (1-based)
        """
        try:
            drivers_with_points = self.get_all_drivers_with_points(session)
            
            for position, driver in enumerate(drivers_with_points, 1):
                if driver.get("id") == driver_id:
                    return position
            
            return len(drivers_with_points) + 1  # If driver not found, put at end
            
        except Exception as e:
            self.logger.error("Error calculating driver championship position: %s", e)
            return 0
    
    def get_driver_season_stats(self, session: Session, driver_id: int, season_id: int = None) -> Dict[str, Any]:
        """
        Get comprehensive season statistics for a driver
        Business logic for driver performance analysis
        
        Args:
            session: Database session
            driver_id: Driver ID
            season_id: Season ID (optional, defaults to current)
            
        Returns:
            Comprehensive driver season statistics
        """
        try:
            database_data = get_database_data(session)
            all_results = database_data["all_results"]
            
            # Filter results for specific driver
            driver_results = [r for r in all_results if r.driver_id == driver_id]
            
            if season_id:
                driver_results = [r for r in driver_results if r.season_id == season_id]
            
            # Calculate comprehensive statistics - business logic
            stats = {
                "total_races": len(driver_results),
                "total_points": sum(r.points or 0 for r in driver_results),
                "wins": len([r for r in driver_results if r.position == "1"]),
                "podiums": len([r for r in driver_results if r.position in ["1", "2", "3"]]),
                "points_finishes": len([r for r in driver_results if (r.points or 0) > 0]),
                "dnf_count": len([r for r in driver_results if r.status and "DNF" in r.status]),
                "best_finish": self._get_best_position(driver_results),
                "average_position": self._calculate_average_position(driver_results)
            }
            
            return stats
            
        except Exception as e:
            self.logger.error("Error getting driver season stats: %s", e)
            return {}
    
    def _get_best_position(self, results: List[Any]) -> int:
        """
        Calculate best finishing position from results
        Helper method for business logic
        
        Args:
            results: List of session results
            
        Returns:
            Best position (1-based, 0 if no valid finishes)
        """
        try:
            valid_positions = []
            for r in results:
                if r.position and r.position.isdigit():
                    valid_positions.append(int(r.position))
            
            return min(valid_positions) if valid_positions else 0
            
        except Exception:
            return 0
    
    def _calculate_average_position(self, results: List[Any]) -> float:
        """
        Calculate average finishing position from results
        Helper method for business logic
        
        Args:
            results: List of session results
            
        Returns:
            Average position (0 if no valid finishes)
        """
        try:
            valid_positions = []
            for r in results:
                if r.position and r.position.isdigit():
                    valid_positions.append(int(r.position))
            
            if valid_positions:
                return sum(valid_positions) / len(valid_positions)
            return 0.0
            
        except Exception:
            return 0.0