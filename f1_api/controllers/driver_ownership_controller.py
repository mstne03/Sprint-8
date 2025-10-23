"""
Driver Ownership controller module for market ownership operations.
This module provides the business logic layer for driver ownership management,
including initialization of driver ownership for leagues, querying ownership status,
and managing the market state of drivers within specific leagues.
"""
import logging
from sqlmodel import Session
from datetime import datetime
from fastapi import HTTPException
from f1_api.controllers.base_controller import BaseController
from f1_api.models.repositories.driver_ownership_repository import DriverOwnershipRepository
from f1_api.models.repositories.drivers_repository import DriversRepository
from f1_api.models.repositories.driver_team_link_repository import DriverTeamLinkRepository
from f1_api.models.app_models import DriverOwnership
from f1_api.models.repositories.sessions_results_repository import SessionResultsRepository
from f1_api.models.lib.drivers_utility import DriversUtility

logger = logging.getLogger(__name__)


class DriverOwnershipController(BaseController):
    """
    Controller class for managing driver ownership operations.
    
    This controller handles the ownership state of drivers within leagues,
    including initialization when leagues are created, tracking ownership
    changes, and managing the market availability of drivers.
    """
    
    def __init__(self, session: Session):
        """
        Initialize the DriverOwnershipController with required repository dependencies.
        
        Args:
            session: SQLModel database session for repository operations
        """
        super().__init__(session)
        self.ownership_repository = DriverOwnershipRepository(session)
        self.driver_team_link_repository = DriverTeamLinkRepository(session)
    
    def initialize_league_ownership(self, league_id: int, season_year: int) -> int:
        """
        Initialize driver ownership for a newly created league.
        Creates DriverOwnership records for all active drivers in the current season.
        All drivers start as free agents (owner_id = None).
        
        Args:
            league_id: ID of the newly created league
            season_year: Current season year to get active drivers
        
        Returns:
            int: Number of driver ownership records created
        
        Raises:
            HTTPException: If unable to fetch active drivers or create ownership records
        """
        try:
            # Get all active drivers from the latest round
            active_driver_ids = self._get_active_drivers_for_season(season_year)
            
            if not active_driver_ids:
                logger.warning("No active drivers found for season %s", season_year)
                return 0
            
            # Get driver details with calculated fantasy_stats (includes dynamic pricing)
            drivers_repo = DriversRepository(self.session, season_year)
            drivers = drivers_repo.get_drivers_by_ids(active_driver_ids)
            
            # Calculate fantasy_stats.price for each driver
            enriched_drivers = self._calculate_driver_prices(drivers, season_year)
            
            created_count = 0
            now = datetime.now()
            
            for enriched_driver in enriched_drivers:
                driver_id = enriched_driver['id']
                
                # Check if ownership record already exists
                existing = self.ownership_repository.get_by_driver_and_league(
                    driver_id, league_id
                )
                
                if not existing:
                    # Get fantasy_stats.price (dynamic market price based on performance)
                    fantasy_price = enriched_driver.get('fantasy_stats', {}).get('price', 10_000_000)
                    
                    ownership = DriverOwnership(
                        driver_id=driver_id,
                        league_id=league_id,
                        owner_id=None,  # Free agent
                        is_listed_for_sale=False,
                        acquisition_price=fantasy_price,  # ✅ Use dynamic fantasy_stats.price
                        created_at=now,
                        updated_at=now
                    )
                    self.ownership_repository.create(ownership)
                    created_count += 1
            
            logger.info("Initialized %d driver ownership records for league %d", created_count, league_id)
            return created_count
            
        except Exception as e:
            logger.error("Failed to initialize league ownership: %s", str(e))
            raise HTTPException(
                status_code=500,
                detail=f"Failed to initialize driver ownership for league: {str(e)}"
            ) from e
    
    def _get_active_drivers_for_season(self, season_year: int) -> list[int]:
        """
        Get list of active driver IDs for the given season.
        Uses the latest round to determine which drivers are currently active.
        
        Args:
            season_year: Season year to query
        
        Returns:
            list[int]: List of unique driver IDs active in the season
        """
        # Get the latest round for the season
        latest_round = self.driver_team_link_repository.get_latest_round_for_season(season_year)
        
        if not latest_round:
            logger.warning("No rounds found for season %s", season_year)
            return []
        
        # Get all driver IDs from the latest round
        driver_team_links = self.driver_team_link_repository.get_links_by_round(
            season_year, latest_round
        )
        
        # Extract unique driver IDs
        driver_ids = list(set(link.driver_id for link in driver_team_links))
        logger.info("Found %d active drivers in season %s, round %d", len(driver_ids), season_year, latest_round)
        
        return driver_ids
    
    def _calculate_driver_prices(self, drivers: list, season_year: int) -> list[dict]:
        """
        Calculate fantasy_stats.price for each driver based on their season performance.
        
        Price formula: 1,000,000 + (points × 1,000) + (podiums × 5,000) + (victories × 10,000)
        
        Uses the same logic as market_controller._enrich_drivers_with_stats() to ensure consistency.
        
        Args:
            drivers: List of Driver objects
            season_year: Season year for stats lookup
        
        Returns:
            List of dicts with driver data + fantasy_stats.price
        """
        
        # Initialize repositories
        results_repo = SessionResultsRepository(season_year, self.session)
        drivers_utility = DriversUtility()
        
        # Get driver results data (same approach as market_controller)
        database_data = results_repo.get_driver_results()
        all_results = database_data["all_results"]
        
        # Calculate stats using DriversUtility
        stats = drivers_utility.get_driver_stats(all_results)
        points_map = {r.driver_id: r.total_points for r in database_data["results"]}
        
        # Enrich each driver with fantasy_stats.price
        enriched = []
        for driver in drivers:
            driver_stats = stats.get(driver.id, {})
            points = points_map.get(driver.id, 0)
            podiums = driver_stats.get("podiums", 0)
            victories = driver_stats.get("victories", 0)
            
            # Calculate fantasy price (same formula as market_controller)
            # Base: 10M + (points × 10k) + (podiums × 50k) + (victories × 100k)
            # No rounding for maximum precision
            fantasy_price = 10_000_000 + (int(points) * 10_000) + (podiums * 50_000) + (victories * 100_000)
            
            enriched.append({
                'id': driver.id,
                'fantasy_stats': {
                    'price': fantasy_price
                }
            })
        
        return enriched
    
    def get_driver_ownership_status(self, driver_id: int, league_id: int) -> DriverOwnership | None:
        """
        Get the ownership status of a specific driver in a league.
        
        Args:
            driver_id: ID of the driver
            league_id: ID of the league
        
        Returns:
            DriverOwnership | None: Ownership record if exists, None otherwise
        """
        return self.ownership_repository.get_by_driver_and_league(driver_id, league_id)
    
    def get_all_drivers_with_ownership(self, league_id: int) -> list[DriverOwnership]:
        """
        Get all driver ownership records for a league.
        
        Args:
            league_id: ID of the league
        
        Returns:
            list[DriverOwnership]: List of all ownership records for the league
        """
        return self.ownership_repository.get_all_by_league(league_id)
    
    def get_free_drivers(self, league_id: int) -> list[DriverOwnership]:
        """
        Get all free agent drivers (no owner) in a league.
        
        Args:
            league_id: ID of the league
        
        Returns:
            list[DriverOwnership]: List of ownership records for free drivers
        """
        return self.ownership_repository.get_free_drivers_in_league(league_id)
    
    def get_drivers_for_sale(self, league_id: int) -> list[DriverOwnership]:
        """
        Get all drivers listed for sale in a league.
        
        Args:
            league_id: ID of the league
        
        Returns:
            list[DriverOwnership]: List of ownership records for drivers on sale
        """
        return self.ownership_repository.get_drivers_for_sale_in_league(league_id)
    
    def get_user_owned_drivers(self, user_id: int, league_id: int) -> list[DriverOwnership]:
        """
        Get all drivers owned by a specific user in a league.
        
        Args:
            user_id: ID of the user
            league_id: ID of the league
        
        Returns:
            list[DriverOwnership]: List of ownership records for user's drivers
        """
        return self.ownership_repository.get_owned_by_user_in_league(user_id, league_id)
