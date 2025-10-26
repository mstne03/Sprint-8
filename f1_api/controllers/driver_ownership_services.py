"""
Driver ownership service functions for route handlers.
These wrapper functions create controller instances and delegate business logic.
"""
from sqlmodel import Session
from f1_api.controllers.driver_ownership_controller import DriverOwnershipController
from f1_api.models.app_models import DriverOwnership


def get_league_driver_ownership_service(league_id: int, session: Session) -> list[DriverOwnership]:
    """
    Get all driver ownership records for a league.
    
    Args:
        league_id: ID of the league
        session: Database session
    
    Returns:
        list[DriverOwnership]: All ownership records for the league
    """
    controller = DriverOwnershipController(session)
    return controller.get_all_drivers_with_ownership(league_id)


def get_free_drivers_service(league_id: int, session: Session) -> list[DriverOwnership]:
    """
    Get all free agent drivers in a league.
    
    Args:
        league_id: ID of the league
        session: Database session
    
    Returns:
        list[DriverOwnership]: Free agent drivers
    """
    controller = DriverOwnershipController(session)
    return controller.get_free_drivers(league_id)


def get_drivers_for_sale_service(league_id: int, session: Session) -> list[DriverOwnership]:
    """
    Get all drivers listed for sale in a league.
    
    Args:
        league_id: ID of the league
        session: Database session
    
    Returns:
        list[DriverOwnership]: Drivers on sale
    """
    controller = DriverOwnershipController(session)
    return controller.get_drivers_for_sale(league_id)


def get_user_drivers_service(league_id: int, user_id: int, session: Session) -> list[DriverOwnership]:
    """
    Get all drivers owned by a user in a league.
    
    Args:
        league_id: ID of the league
        user_id: ID of the user
        session: Database session
    
    Returns:
        list[DriverOwnership]: User's owned drivers
    """
    controller = DriverOwnershipController(session)
    return controller.get_user_owned_drivers(user_id, league_id)


def get_driver_ownership_status_service(
    driver_id: int, 
    league_id: int, 
    session: Session
) -> DriverOwnership | None:
    """
    Get ownership status of a specific driver in a league.
    
    Args:
        driver_id: ID of the driver
        league_id: ID of the league
        session: Database session
    
    Returns:
        DriverOwnership | None: Ownership record or None if not found
    """
    controller = DriverOwnershipController(session)
    return controller.get_driver_ownership_status(driver_id, league_id)
