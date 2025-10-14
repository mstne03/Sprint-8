"""Drivers controller module for drivers-related operations"""
import logging
from sqlmodel import Session
from f1_api.models.business.drivers_business import DriversBusiness
from f1_api.models.repositories.drivers_repository import DriversQueryRepository
class DriversController:
    """Provides drivers response"""
    def __init__(self, session: Session):
        self.session = session
        self.repository = DriversQueryRepository(self.session)
        self.business_logic = DriversBusiness()
    
    def get_drivers_service(self) -> list:
        """
        Get all drivers sorted by championship points up to the last round
        
        Args:
            session: Database session
            
        Returns:
            list: Drivers with calculated points and stats
        """
        try:
            database_data = self.repository.get_driver_results()
            max_round = database_data["max_round"]
            sprint_rounds = database_data["sprint_rounds"]
            results = database_data["results"]
            all_results = database_data["all_results"]
            db_drivers = database_data["drivers"]

            points_map = {r.driver_id: r.total_points for r in results}

            available_points = 25 * max_round + len(sprint_rounds) * 8

            stats = self.business_logic.get_driver_stats(all_results)
            
            drivers_sorted = sorted(
                db_drivers,
                key=lambda d: points_map.get(d.id, 0),
                reverse=True
            )

            drivers = self.business_logic.get_drivers_mapped(max_round, stats, points_map, available_points, drivers_sorted, self.session)

            return drivers
            
        except Exception as e:  # pylint: disable=broad-except
            logging.warning("Drivers controller execution interrupted by the following exception: %s", e)
            return []
        

def get_drivers_service(session: Session) -> list:
    """
    Legacy function for getting drivers
    """
    controller = DriversController(session)
    return controller.get_drivers_service()