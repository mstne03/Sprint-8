"""
Market controller module for driver market operations.
Handles buying, selling, listing drivers, and executing buyout clauses.
"""
import logging
from sqlmodel import Session
from datetime import datetime, timedelta
from fastapi import HTTPException
from f1_api.controllers.base_controller import BaseController
from f1_api.models.repositories.driver_ownership_repository import DriverOwnershipRepository
from f1_api.models.repositories.market_transactions_repository import MarketTransactionsRepository
from f1_api.models.repositories.buyout_clause_history_repository import BuyoutClauseHistoryRepository
from f1_api.models.repositories.user_teams_repository import UserTeamsRepository
from f1_api.models.repositories.users_repository import UserRepository
from f1_api.models.repositories.sessions_results_repository import SessionResultsRepository
from f1_api.models.lib.drivers_utility import DriversUtility
from f1_api.models.app_models import DriverOwnership, MarketTransactions, BuyoutClauseHistory

logger = logging.getLogger(__name__)

# Configuration constants
BUYOUT_MULTIPLIER = 1.3  # 130% of acquisition price
LOCK_DAYS_AFTER_PURCHASE = 7  # Days a driver is locked after purchase/buyout
SELL_TO_MARKET_REFUND = 0.8  # 80% refund when quick selling
MAX_BUYOUTS_PER_USER_PAIR_PER_SEASON = 2  # Max buyouts between two users
MAX_DRIVERS_PER_USER = 4  # 3 lineup + 1 reserve
CURRENT_SEASON = 2025  # TODO: Get dynamically


class MarketController(BaseController):
    """
    Controller for managing driver market operations.
    
    Handles:
    - Buying drivers from market (free agents)
    - Buying drivers from other users (listed for sale)
    - Selling drivers to market (quick sell)
    - Listing/unlisting drivers for sale
    - Executing buyout clauses
    - Emergency driver assignment
    """
    
    def __init__(self, session: Session):
        super().__init__(session)
        self.ownership_repo = DriverOwnershipRepository(session)
        self.transactions_repo = MarketTransactionsRepository(session)
        self.buyout_repo = BuyoutClauseHistoryRepository(session)
        self.user_teams_repo = UserTeamsRepository(session)
        self.users_repo = UserRepository(session)
        self.results_repo = SessionResultsRepository(CURRENT_SEASON, session)
        self.drivers_utility = DriversUtility()
    
    def _enrich_drivers_with_stats(self, drivers: list) -> list:
        """
        Enrich driver data with season_results and fantasy_stats.
        Reuses logic from DriversController to ensure consistency.
        """
        try:
            # Get driver results data
            database_data = self.results_repo.get_driver_results()
            max_round = database_data["max_round"]
            sprint_rounds = database_data["sprint_rounds"]
            all_results = database_data["all_results"]
            
            # Calculate stats
            stats = self.drivers_utility.get_driver_stats(all_results)
            points_map = {r.driver_id: r.total_points for r in database_data["results"]}
            available_points = 25 * max_round + len(sprint_rounds) * 8
            
            # Enrich each driver
            enriched_drivers = []
            for driver in drivers:
                driver_stats = stats.get(driver.id, {})
                finishes = driver_stats.get("finish_positions", None)
                grids = driver_stats.get("grid_positions", None)
                pole_victories = driver_stats.get("pole_victories", None)
                poles = driver_stats.get("poles", 0)
                points = points_map.get(driver.id, 0)
                podiums = driver_stats.get("podiums", 0)
                victories = driver_stats.get("victories", 0)
                overtakes = driver_stats.get("overtakes", 0)
                
                enriched_driver = {
                    **driver.model_dump(),
                    "season_results": {
                        "points": points,
                        "poles": poles,
                        "podiums": podiums,
                        "fastest_laps": driver_stats.get("fastest_laps", 0),
                        "victories": victories,
                        "sprint_podiums": driver_stats.get("sprint_podiums", 0),
                        "sprint_victories": driver_stats.get("sprint_victories", 0),
                        "sprint_poles": driver_stats.get("sprint_poles", 0)
                    },
                    "fantasy_stats": {
                        "avg_finish": round(sum(finishes) / len(finishes), 1) if finishes else 0,
                        "avg_grid_position": round(sum(grids) / len(grids), 1) if grids else 0,
                        "pole_win_conversion": round(((pole_victories * 100) / poles), 1) if poles else 0,
                        "price": round(1000000 + (points * 1000) + (podiums * 5000) + (victories * 10000), 0),
                        "overtake_efficiency": round(sum(overtakes) / len(overtakes), 1) if overtakes else 0,
                        "available_points_percentatge": round(points * 100 / available_points, 1) if available_points > 0 else 0,
                    }
                }
                enriched_drivers.append(enriched_driver)
            
            return enriched_drivers
            
        except Exception as e:
            logger.error(f"Error enriching drivers with stats: {e}")
            # Return drivers without enrichment if stats calculation fails
            return [driver.model_dump() for driver in drivers]
    
    def _classify_drivers_by_tier(self, drivers_with_points: list) -> dict:
        """
        Classify drivers into tiers based on their points percentage relative to the leader.
        
        Tier A (Top): >= 70% of leader's points
        Tier B (Mid): 40-69% of leader's points  
        Tier C (Low): < 40% of leader's points
        
        Args:
            drivers_with_points: List of tuples (driver_id, points)
        
        Returns:
            dict with 'tier_a', 'tier_b', 'tier_c' lists of driver_ids
        """
        if not drivers_with_points:
            return {'tier_a': [], 'tier_b': [], 'tier_c': []}
        
        # Sort by points descending
        sorted_drivers = sorted(drivers_with_points, key=lambda x: x[1], reverse=True)
        max_points = sorted_drivers[0][1] if sorted_drivers[0][1] > 0 else 1  # Avoid division by zero
        
        tiers = {'tier_a': [], 'tier_b': [], 'tier_c': []}
        
        for driver_id, points in sorted_drivers:
            percentage = (points / max_points) * 100
            
            if percentage >= 70:
                tiers['tier_a'].append(driver_id)
            elif percentage >= 40:
                tiers['tier_b'].append(driver_id)
            else:
                tiers['tier_c'].append(driver_id)
        
        logger.info("Driver classification: Tier A: %d, Tier B: %d, Tier C: %d",
                   len(tiers['tier_a']), len(tiers['tier_b']), len(tiers['tier_c']))
        
        return tiers
    
    def initialize_user_team_on_join(self, user_id: int, league_id: int) -> dict:
        """
        Initialize a user's team when they join a league.
        Assigns 3 random Tier C drivers (low tier) and creates UserTeam with remaining budget.
        
        Args:
            user_id: Internal user ID
            league_id: League ID
        
        Returns:
            dict with team_id, assigned_drivers, budget_remaining
        """
        from f1_api.models.app_models import UserTeams
        from f1_api.models.f1_schemas import Teams
        from sqlmodel import select
        import random
        
        logger.info("Initializing team for user %d in league %d", user_id, league_id)
        
        # Check if user already has a team
        existing_team = self.session.exec(
            select(UserTeams).where(
                UserTeams.user_id == user_id,
                UserTeams.league_id == league_id,
                UserTeams.is_active == True
            )
        ).first()
        if existing_team:
            logger.warning("User %d already has team in league %d", user_id, league_id)
            raise HTTPException(400, "User already has a team in this league")
        
        # Get all free drivers in league with their points
        free_ownerships = self.ownership_repo.get_free_drivers_in_league(league_id)
        if len(free_ownerships) < 3:
            raise HTTPException(500, "Not enough free drivers available to initialize team")
        
        # Get driver points using results repository
        database_data = self.results_repo.get_driver_results()
        points_map = {r.driver_id: r.total_points for r in database_data["results"]}
        
        # Create list of (driver_id, points) for free drivers
        drivers_with_points = []
        for ownership in free_ownerships:
            points = points_map.get(ownership.driver_id, 0)
            drivers_with_points.append((ownership.driver_id, points))
        
        # Classify drivers by tier
        tiers = self._classify_drivers_by_tier(drivers_with_points)
        
        # Select 3 random Tier C drivers (or Tier B if not enough Tier C)
        tier_c_ids = tiers['tier_c']
        tier_b_ids = tiers['tier_b']
        
        available_low_tier = tier_c_ids + tier_b_ids
        
        if len(available_low_tier) < 3:
            # Emergency: use any available drivers
            logger.warning("Not enough low tier drivers, using any available")
            available_low_tier = [d[0] for d in drivers_with_points]
        
        # Randomly select 3 drivers
        selected_driver_ids = random.sample(available_low_tier, 3)
        
        # Assign drivers to user (free starter pack)
        assigned_drivers = []
        
        for driver_id in selected_driver_ids:
            ownership = next((o for o in free_ownerships if o.driver_id == driver_id), None)
            if not ownership:
                continue
            
            # Assign ownership with 0 cost (starter pack)
            ownership.owner_id = user_id
            ownership.acquisition_price = 0  # Free starter pack
            ownership.is_listed_for_sale = False
            ownership.locked_until = None
            ownership.updated_at = datetime.now()
            self.ownership_repo.update(ownership)
            
            assigned_drivers.append(driver_id)
            
            # Create transaction
            transaction = MarketTransactions(
                driver_id=driver_id,
                league_id=league_id,
                seller_id=None,
                buyer_id=user_id,
                transaction_price=0,  # Free initial assignment
                transaction_type='emergency_assignment',
                transaction_date=datetime.now()
            )
            self.transactions_repo.create(transaction)
        
        # Get a default constructor (first available)
        default_constructor = self.session.exec(select(Teams)).first()
        if not default_constructor:
            raise HTTPException(500, "No constructors available")
        
        # Create UserTeam with full initial budget
        INITIAL_BUDGET = 100_000_000  # 100M
        budget_remaining = INITIAL_BUDGET  # Full budget, drivers are free starter pack
        
        new_team = UserTeams(
            user_id=user_id,
            league_id=league_id,
            team_name=f"Team {user_id}",  # Default name, user can change later
            driver_1_id=assigned_drivers[0],
            driver_2_id=assigned_drivers[1],
            driver_3_id=assigned_drivers[2],
            reserve_driver_id=None,
            constructor_id=default_constructor.id,
            total_points=0,
            budget_remaining=budget_remaining,
            is_active=True
        )
        
        self.session.add(new_team)
        self.session.flush()
        
        logger.info("Team initialized for user %d: drivers %s, budget remaining: %d",
                   user_id, assigned_drivers, budget_remaining)
        
        return {
            "team_id": new_team.id,
            "assigned_drivers": assigned_drivers,
            "constructor_id": default_constructor.id,
            "total_cost": 0,  # Free starter pack
            "budget_remaining": budget_remaining
        }
    
    def _count_user_drivers(self, user_id: int, league_id: int) -> int:
        """Count how many drivers a user currently owns."""
        ownerships = self.ownership_repo.get_owned_by_user_in_league(user_id, league_id)
        return len(ownerships)
    
    def _get_driver_slot_number(self, team, driver_id: int) -> int | None:
        """Find which slot (1, 2, or 3) a driver occupies in lineup. Returns None if not in lineup."""
        if team.driver_1_id == driver_id:
            return 1
        elif team.driver_2_id == driver_id:
            return 2
        elif team.driver_3_id == driver_id:
            return 3
        return None
    
    def _is_driver_locked(self, ownership: DriverOwnership) -> bool:
        """Check if a driver is currently locked."""
        if ownership.locked_until is None:
            return False
        return ownership.locked_until > datetime.now()
    
    def buy_driver_from_market(
        self, 
        driver_id: int, 
        buyer_id: int, 
        league_id: int
    ) -> dict:
        """
        Buy a free agent driver from the market.
        
        Args:
            driver_id: ID of the driver to buy
            buyer_id: ID of the user buying (internal user ID)
            league_id: ID of the league
        
        Returns:
            dict with transaction details
        
        Raises:
            HTTPException for validation errors
        """
        # Get ownership
        ownership = self.ownership_repo.get_by_driver_and_league(driver_id, league_id)
        if not ownership:
            raise HTTPException(404, "Driver not found in this league")
        
        # Validate driver is free
        if ownership.owner_id is not None:
            raise HTTPException(400, "Driver is not a free agent")
        
        # Get buyer's team
        buyer_team = self.user_teams_repo.get_active_team_by_league_and_user(buyer_id, league_id)
        if not buyer_team:
            raise HTTPException(404, "Buyer team not found")
        
        # Validate max drivers limit
        current_count = self._count_user_drivers(buyer_id, league_id)
        if current_count >= MAX_DRIVERS_PER_USER:
            raise HTTPException(400, f"Maximum {MAX_DRIVERS_PER_USER} drivers per user")
        
        # Validate budget
        price = ownership.acquisition_price
        if buyer_team.budget_remaining < price:
            raise HTTPException(400, "Insufficient budget")
        
        # Execute purchase
        ownership.owner_id = buyer_id
        ownership.locked_until = datetime.now() + timedelta(days=LOCK_DAYS_AFTER_PURCHASE)
        ownership.updated_at = datetime.now()
        self.ownership_repo.update(ownership)
        
        # Update budget
        buyer_team.budget_remaining -= price
        buyer_team.updated_at = datetime.now()
        
        # Create transaction
        transaction = MarketTransactions(
            driver_id=driver_id,
            league_id=league_id,
            seller_id=None,  # Free agent purchase
            buyer_id=buyer_id,
            transaction_price=price,
            transaction_type='buy_from_market',
            transaction_date=datetime.now()
        )
        self.transactions_repo.create(transaction)
        
        logger.info("User %d bought driver %d from market for %f", buyer_id, driver_id, price)
        
        return {
            "success": True,
            "driver_id": driver_id,
            "price": price,
            "locked_until": ownership.locked_until,
            "new_budget": buyer_team.budget_remaining
        }
    
    def buy_driver_from_user(
        self,
        driver_id: int,
        buyer_id: int,
        seller_id: int,
        league_id: int
    ) -> dict:
        """
        Buy a driver listed for sale from another user.
        
        Args:
            driver_id: ID of the driver to buy
            buyer_id: ID of the buyer (internal user ID)
            seller_id: ID of the seller (internal user ID)
            league_id: ID of the league
        
        Returns:
            dict with transaction details
        """
        # Get ownership
        ownership = self.ownership_repo.get_by_driver_and_league(driver_id, league_id)
        if not ownership:
            raise HTTPException(404, "Driver not found")
        
        # Validate ownership and sale status
        if ownership.owner_id != seller_id:
            raise HTTPException(400, "Seller does not own this driver")
        
        if not ownership.is_listed_for_sale:
            raise HTTPException(400, "Driver is not listed for sale")
        
        # Get teams
        buyer_team = self.user_teams_repo.get_active_team_by_league_and_user(buyer_id, league_id)
        seller_team = self.user_teams_repo.get_active_team_by_league_and_user(seller_id, league_id)
        
        if not buyer_team or not seller_team:
            raise HTTPException(404, "Team not found")
        
        # Validate max drivers
        current_count = self._count_user_drivers(buyer_id, league_id)
        if current_count >= MAX_DRIVERS_PER_USER:
            raise HTTPException(400, f"Maximum {MAX_DRIVERS_PER_USER} drivers per user")
        
        # Validate budget
        price = ownership.acquisition_price
        if buyer_team.budget_remaining < price:
            raise HTTPException(400, "Insufficient budget")
        
        # Transfer ownership
        ownership.owner_id = buyer_id
        ownership.acquisition_price = price
        ownership.is_listed_for_sale = False
        ownership.locked_until = datetime.now() + timedelta(days=LOCK_DAYS_AFTER_PURCHASE)
        ownership.updated_at = datetime.now()
        self.ownership_repo.update(ownership)
        
        # Update budgets
        buyer_team.budget_remaining -= price
        seller_team.budget_remaining += price
        buyer_team.updated_at = datetime.now()
        seller_team.updated_at = datetime.now()
        
        # Create transaction
        transaction = MarketTransactions(
            driver_id=driver_id,
            league_id=league_id,
            seller_id=seller_id,
            buyer_id=buyer_id,
            transaction_price=price,
            transaction_type='buy_from_user',
            transaction_date=datetime.now()
        )
        self.transactions_repo.create(transaction)
        
        logger.info("User %d bought driver %d from user %d for %f", buyer_id, driver_id, seller_id, price)
        
        return {
            "success": True,
            "driver_id": driver_id,
            "price": price,
            "seller_id": seller_id,
            "locked_until": ownership.locked_until,
            "buyer_new_budget": buyer_team.budget_remaining,
            "seller_new_budget": seller_team.budget_remaining
        }
    
    def sell_driver_to_market(
        self,
        driver_id: int,
        seller_id: int,
        league_id: int
    ) -> dict:
        """
        Quick sell a driver back to the market (80% refund).
        User must maintain at least 3 drivers (minimum lineup).
        
        Args:
            driver_id: ID of the driver to sell
            seller_id: ID of the seller (internal user ID)
            league_id: ID of the league
        
        Returns:
            dict with refund details
        """
        # Get ownership
        ownership = self.ownership_repo.get_by_driver_and_league(driver_id, league_id)
        if not ownership:
            raise HTTPException(404, "Driver not found")
        
        # Validate ownership
        if ownership.owner_id != seller_id:
            raise HTTPException(400, "You do not own this driver")
        
        # Check if driver is locked
        if self._is_driver_locked(ownership):
            raise HTTPException(403, {
                "error": "driver_locked",
                "message": f"Driver is locked until {ownership.locked_until.isoformat()}",
                "locked_until": ownership.locked_until.isoformat()
            })
        
        # Check minimum driver count (must keep at least 3 for lineup)
        current_driver_count = self._count_user_drivers(seller_id, league_id)
        if current_driver_count <= 3:
            raise HTTPException(400, {
                "error": "minimum_drivers",
                "message": "Cannot sell driver. You must maintain at least 3 drivers for your lineup."
            })
        
        # Get seller's team
        seller_team = self.user_teams_repo.get_active_team_by_league_and_user(seller_id, league_id)
        if not seller_team:
            raise HTTPException(404, "Team not found")
        
        # Calculate refund (80%)
        refund = ownership.acquisition_price * SELL_TO_MARKET_REFUND
        
        # Release driver ownership
        ownership.owner_id = None
        ownership.is_listed_for_sale = False
        ownership.locked_until = None
        ownership.updated_at = datetime.now()
        self.ownership_repo.update(ownership)
        
        # Remove driver from team (lineup or reserve)
        if seller_team.driver_1_id == driver_id:
            seller_team.driver_1_id = None
        elif seller_team.driver_2_id == driver_id:
            seller_team.driver_2_id = None
        elif seller_team.driver_3_id == driver_id:
            seller_team.driver_3_id = None
        elif seller_team.reserve_driver_id == driver_id:
            seller_team.reserve_driver_id = None
        
        # Update budget
        seller_team.budget_remaining += refund
        seller_team.updated_at = datetime.now()
        
        # Create transaction
        transaction = MarketTransactions(
            driver_id=driver_id,
            league_id=league_id,
            seller_id=seller_id,
            buyer_id=seller_id,  # Same user
            transaction_price=refund,
            transaction_type='sell_to_market',
            transaction_date=datetime.now()
        )
        self.transactions_repo.create(transaction)
        
        logger.info("User %d sold driver %d to market for %f refund", seller_id, driver_id, refund)
        
        return {
            "success": True,
            "driver_id": driver_id,
            "refund": refund,
            "new_budget": seller_team.budget_remaining
        }
    
    def list_driver_for_sale(
        self,
        driver_id: int,
        owner_id: int,
        league_id: int,
        asking_price: float | None = None
    ) -> dict:
        """
        List a driver for sale.
        User must maintain at least 3 drivers (minimum lineup).
        
        Args:
            driver_id: ID of the driver to list
            owner_id: ID of the owner (internal user ID)
            league_id: ID of the league
            asking_price: Optional custom price (defaults to acquisition_price)
        
        Returns:
            dict with listing confirmation
        """
        # Get ownership
        ownership = self.ownership_repo.get_by_driver_and_league(driver_id, league_id)
        if not ownership:
            raise HTTPException(404, "Driver not found")
        
        # Validate ownership
        if ownership.owner_id != owner_id:
            raise HTTPException(400, "You do not own this driver")
        
        # Check if driver is locked
        if self._is_driver_locked(ownership):
            raise HTTPException(403, {
                "error": "driver_locked",
                "message": f"Driver is locked until {ownership.locked_until.isoformat()}",
                "locked_until": ownership.locked_until.isoformat()
            })
        
        # Check minimum driver count (must keep at least 3 for lineup)
        current_driver_count = self._count_user_drivers(owner_id, league_id)
        if current_driver_count <= 3:
            raise HTTPException(400, {
                "error": "minimum_drivers",
                "message": "Cannot list driver for sale. You must maintain at least 3 drivers for your lineup."
            })
        
        # Update listing status
        ownership.is_listed_for_sale = True
        if asking_price is not None:
            ownership.acquisition_price = asking_price
        ownership.updated_at = datetime.now()
        self.ownership_repo.update(ownership)
        
        logger.info("User %d listed driver %d for sale at %f", owner_id, driver_id, ownership.acquisition_price)
        
        return {
            "success": True,
            "driver_id": driver_id,
            "asking_price": ownership.acquisition_price,
            "is_listed": True
        }
    
    def unlist_driver_from_sale(
        self,
        driver_id: int,
        owner_id: int,
        league_id: int
    ) -> dict:
        """
        Remove a driver from sale listings.
        
        Args:
            driver_id: ID of the driver to unlist
            owner_id: ID of the owner (internal user ID)
            league_id: ID of the league
        
        Returns:
            dict with unlisting confirmation
        """
        # Get ownership
        ownership = self.ownership_repo.get_by_driver_and_league(driver_id, league_id)
        if not ownership:
            raise HTTPException(404, "Driver not found")
        
        # Validate ownership
        if ownership.owner_id != owner_id:
            raise HTTPException(400, "You do not own this driver")
        
        # Update listing status
        ownership.is_listed_for_sale = False
        ownership.updated_at = datetime.now()
        self.ownership_repo.update(ownership)
        
        logger.info("User %d unlisted driver %d from sale", owner_id, driver_id)
        
        return {
            "success": True,
            "driver_id": driver_id,
            "is_listed": False
        }
    
    def execute_buyout_clause(
        self,
        driver_id: int,
        buyer_id: int,
        victim_id: int,
        league_id: int
    ) -> dict:
        """
        Execute a buyout clause on another user's driver.
        Costs 130% of the driver's acquisition price.
        Can only be done if driver is not locked.
        
        Args:
            driver_id: ID of the driver to buy out
            buyer_id: ID of the user executing the buyout
            victim_id: ID of the current owner
            league_id: ID of the league
        
        Returns:
            dict with buyout details and replacement info
        """
        # Get ownership
        ownership = self.ownership_repo.get_by_driver_and_league(driver_id, league_id)
        if not ownership:
            raise HTTPException(404, "Driver not found")
        
        # Validate ownership
        if ownership.owner_id != victim_id:
            raise HTTPException(400, "Victim does not own this driver")
        
        # Check if driver is locked
        if self._is_driver_locked(ownership):
            raise HTTPException(403, {
                "error": "driver_locked",
                "message": f"Driver is locked until {ownership.locked_until.isoformat()}",
                "locked_until": ownership.locked_until.isoformat()
            })
        
        # Check buyout limit
        buyout_count = self.buyout_repo.count_buyouts_between_users(
            buyer_id, victim_id, league_id, CURRENT_SEASON
        )
        if buyout_count >= MAX_BUYOUTS_PER_USER_PAIR_PER_SEASON:
            raise HTTPException(403, {
                "error": "buyout_limit_reached",
                "message": f"Maximum {MAX_BUYOUTS_PER_USER_PAIR_PER_SEASON} buyouts per season between users"
            })
        
        # Get teams
        buyer_team = self.user_teams_repo.get_active_team_by_league_and_user(buyer_id, league_id)
        victim_team = self.user_teams_repo.get_active_team_by_league_and_user(victim_id, league_id)
        
        if not buyer_team or not victim_team:
            raise HTTPException(404, "Team not found")
        
        # Validate max drivers for buyer
        buyer_driver_count = self._count_user_drivers(buyer_id, league_id)
        if buyer_driver_count >= MAX_DRIVERS_PER_USER:
            raise HTTPException(400, f"Buyer already has {MAX_DRIVERS_PER_USER} drivers")
        
        # Calculate buyout price (130%)
        buyout_price = ownership.acquisition_price * BUYOUT_MULTIPLIER
        
        # Validate buyer budget
        if buyer_team.budget_remaining < buyout_price:
            raise HTTPException(400, "Insufficient budget for buyout")
        
        # Check if driver is in victim's lineup
        slot_number = self._get_driver_slot_number(victim_team, driver_id)
        replacement_info = None
        
        if slot_number is not None:
            # Driver is in lineup - need to replace
            if victim_team.reserve_driver_id:
                # CASE A: Has reserve - auto swap
                setattr(victim_team, f'driver_{slot_number}_id', victim_team.reserve_driver_id)
                victim_team.reserve_driver_id = None
                replacement_info = {
                    "auto_replaced": True,
                    "replacement_type": "reserve_promoted",
                    "message": "Reserve driver promoted to lineup"
                }
            else:
                # CASE B: No reserve - assign emergency tier C
                # This will be handled by assign_emergency_driver method
                emergency_ownership = self._assign_emergency_tier_c_driver(league_id, victim_id)
                setattr(victim_team, f'driver_{slot_number}_id', emergency_ownership.driver_id)
                replacement_info = {
                    "auto_replaced": True,
                    "replacement_type": "emergency_tier_c",
                    "emergency_driver_id": emergency_ownership.driver_id,
                    "message": "Emergency tier C driver assigned"
                }
        elif victim_team.reserve_driver_id == driver_id:
            # Driver was in reserve
            victim_team.reserve_driver_id = None
            replacement_info = {
                "auto_replaced": False,
                "replacement_type": "reserve_removed",
                "message": "Reserve driver removed"
            }
        
        # Transfer ownership
        ownership.owner_id = buyer_id
        ownership.acquisition_price = buyout_price
        ownership.is_listed_for_sale = False
        ownership.locked_until = datetime.now() + timedelta(days=LOCK_DAYS_AFTER_PURCHASE)
        ownership.updated_at = datetime.now()
        self.ownership_repo.update(ownership)
        
        # Update budgets
        buyer_team.budget_remaining -= buyout_price
        victim_team.budget_remaining += buyout_price
        buyer_team.updated_at = datetime.now()
        victim_team.updated_at = datetime.now()
        
        # Create transaction
        transaction = MarketTransactions(
            driver_id=driver_id,
            league_id=league_id,
            seller_id=victim_id,
            buyer_id=buyer_id,
            transaction_price=buyout_price,
            transaction_type='buyout_clause',
            transaction_date=datetime.now()
        )
        self.transactions_repo.create(transaction)
        
        # Create buyout history
        buyout_history = BuyoutClauseHistory(
            league_id=league_id,
            buyer_id=buyer_id,
            victim_id=victim_id,
            driver_id=driver_id,
            buyout_price=buyout_price,
            buyout_date=datetime.now(),
            season_year=CURRENT_SEASON
        )
        self.buyout_repo.create(buyout_history)
        
        logger.info("User %d executed buyout on driver %d from user %d for %f", 
                   buyer_id, driver_id, victim_id, buyout_price)
        
        return {
            "success": True,
            "driver_id": driver_id,
            "buyout_price": buyout_price,
            "buyer_new_budget": buyer_team.budget_remaining,
            "victim_new_budget": victim_team.budget_remaining,
            "locked_until": ownership.locked_until,
            "replacement_info": replacement_info
        }
    
    def _assign_emergency_tier_c_driver(self, league_id: int, user_id: int) -> DriverOwnership:
        """
        Assign a free tier C driver to a user who suffered a buyout without reserve.
        Driver is assigned for free (price = 0) and not locked.
        
        Args:
            league_id: ID of the league
            user_id: ID of the user receiving the emergency driver
        
        Returns:
            DriverOwnership of the assigned driver
        """
        # Get free tier C drivers (bottom 5 drivers by points, not owned)
        free_tier_c = self.ownership_repo.get_free_drivers_in_league(league_id)
        
        # Filter for tier C only (acquisition_price = base_price, which is 10M for tier C)
        # TODO: Better tier classification system
        tier_c_candidates = [d for d in free_tier_c if d.acquisition_price <= 10_000_000]
        
        if not tier_c_candidates:
            # Emergency: liberate an unused tier C driver
            logger.warning("No tier C drivers available, liberating one for emergency")
            # For now, just take any free driver
            tier_c_candidates = free_tier_c
        
        if not tier_c_candidates:
            raise HTTPException(500, "No drivers available for emergency assignment")
        
        # Assign the first available
        emergency_driver = tier_c_candidates[0]
        emergency_driver.owner_id = user_id
        emergency_driver.acquisition_price = 0  # FREE
        emergency_driver.locked_until = None  # Not locked
        emergency_driver.updated_at = datetime.now()
        self.ownership_repo.update(emergency_driver)
        
        # Create transaction
        transaction = MarketTransactions(
            driver_id=emergency_driver.driver_id,
            league_id=league_id,
            seller_id=None,
            buyer_id=user_id,
            transaction_price=0,
            transaction_type='emergency_assignment',
            transaction_date=datetime.now()
        )
        self.transactions_repo.create(transaction)
        
        logger.info("Assigned emergency tier C driver %d to user %d for free", 
                   emergency_driver.driver_id, user_id)
        
        return emergency_driver
    
    def get_free_drivers(self, league_id: int) -> list:
        """
        Get all free agent drivers with their complete information.
        
        Returns list of drivers with ownership info, stats, etc.
        """
        from f1_api.models.repositories.drivers_repository import DriversRepository
        from f1_api.models.repositories.driver_team_link_repository import DriverTeamLinkRepository
        
        drivers_repo = DriversRepository(self.session, CURRENT_SEASON)
        link_repo = DriverTeamLinkRepository(self.session)
        
        # Get all free ownerships
        free_ownerships = self.ownership_repo.get_free_drivers_in_league(league_id)
        
        if not free_ownerships:
            return []
        
        # Get driver IDs
        driver_ids = [o.driver_id for o in free_ownerships]
        
        # Get complete driver data
        drivers = drivers_repo.get_drivers_by_ids(driver_ids)
        
        # Enrich drivers with season_results and fantasy_stats
        enriched_drivers = self._enrich_drivers_with_stats(drivers)
        
        # Get latest team info for current season with JOIN to Teams
        from f1_api.models.f1_schemas import DriverTeamLink, Teams
        from sqlmodel import select
        
        latest_round = link_repo.get_latest_round_for_season(CURRENT_SEASON)
        
        # Create map of driver_id -> team_name using JOIN
        team_map = {}
        if latest_round:
            results = self.session.exec(
                select(DriverTeamLink.driver_id, Teams.team_name)
                .join(Teams, DriverTeamLink.team_id == Teams.id)
                .where(
                    DriverTeamLink.season_id == CURRENT_SEASON,
                    DriverTeamLink.round_number == latest_round
                )
            ).all()
            team_map = {driver_id: team_name for driver_id, team_name in results}
        
        # Build response with ownership info
        result = []
        for driver_dict in enriched_drivers:
            ownership = next((o for o in free_ownerships if o.driver_id == driver_dict['id']), None)
            
            driver_dict['team_name'] = team_map.get(driver_dict['id'])
            driver_dict['ownership'] = ownership.model_dump() if ownership else None
            driver_dict['isOwned'] = False
            driver_dict['isOwnedByMe'] = False
            driver_dict['isFreeAgent'] = True
            driver_dict['isForSale'] = False
            driver_dict['isLocked'] = False
            driver_dict['canBuyout'] = False
            
            result.append(driver_dict)
        
        return result
    
    def get_drivers_for_sale(self, league_id: int) -> list:
        """Get all drivers listed for sale."""
        from f1_api.models.repositories.drivers_repository import DriversRepository
        from f1_api.models.repositories.driver_team_link_repository import DriverTeamLinkRepository
        
        drivers_repo = DriversRepository(self.session, CURRENT_SEASON)
        link_repo = DriverTeamLinkRepository(self.session)
        
        # Get listed ownerships
        listed_ownerships = self.ownership_repo.get_drivers_for_sale_in_league(league_id)
        
        if not listed_ownerships:
            return []
        
        driver_ids = [o.driver_id for o in listed_ownerships]
        drivers = drivers_repo.get_drivers_by_ids(driver_ids)
        
        # Enrich drivers with season_results and fantasy_stats
        enriched_drivers = self._enrich_drivers_with_stats(drivers)
        
        # Get team names using JOIN
        from f1_api.models.f1_schemas import DriverTeamLink, Teams
        from sqlmodel import select
        
        latest_round = link_repo.get_latest_round_for_season(CURRENT_SEASON)
        
        team_map = {}
        if latest_round:
            results = self.session.exec(
                select(DriverTeamLink.driver_id, Teams.team_name)
                .join(Teams, DriverTeamLink.team_id == Teams.id)
                .where(
                    DriverTeamLink.season_id == CURRENT_SEASON,
                    DriverTeamLink.round_number == latest_round
                )
            ).all()
            team_map = {driver_id: team_name for driver_id, team_name in results}
        
        # Get owner names
        from f1_api.models.app_models import Users
        from sqlmodel import col
        owner_ids = [o.owner_id for o in listed_ownerships if o.owner_id]
        if owner_ids:
            owners_list = self.session.exec(
                select(Users).where(col(Users.id).in_(owner_ids))
            ).all()
            owners = {u.id: u.user_name for u in owners_list}
        else:
            owners = {}
        
        result = []
        for driver_dict in enriched_drivers:
            ownership = next((o for o in listed_ownerships if o.driver_id == driver_dict['id']), None)
            
            driver_dict['team_name'] = team_map.get(driver_dict['id'])
            driver_dict['ownership'] = ownership.model_dump() if ownership else None
            driver_dict['isOwned'] = True
            driver_dict['isOwnedByMe'] = False
            driver_dict['isFreeAgent'] = False
            driver_dict['isForSale'] = True
            driver_dict['isLocked'] = self._is_driver_locked(ownership) if ownership else False
            driver_dict['canBuyout'] = False
            driver_dict['ownerName'] = owners.get(ownership.owner_id) if ownership and ownership.owner_id else None
            result.append(driver_dict)
        
        return result
    
    def get_user_drivers(self, user_id: int, league_id: int) -> list:
        """Get all drivers owned by a specific user."""
        from f1_api.models.repositories.drivers_repository import DriversRepository
        from f1_api.models.repositories.driver_team_link_repository import DriverTeamLinkRepository
        
        drivers_repo = DriversRepository(self.session, CURRENT_SEASON)
        link_repo = DriverTeamLinkRepository(self.session)
        
        ownerships = self.ownership_repo.get_owned_by_user_in_league(user_id, league_id)
        
        if not ownerships:
            return []
        
        driver_ids = [o.driver_id for o in ownerships]
        drivers = drivers_repo.get_drivers_by_ids(driver_ids)
        
        # Enrich drivers with season_results and fantasy_stats
        enriched_drivers = self._enrich_drivers_with_stats(drivers)
        
        # Get team names using JOIN
        from f1_api.models.f1_schemas import DriverTeamLink, Teams
        from sqlmodel import select
        
        latest_round = link_repo.get_latest_round_for_season(CURRENT_SEASON)
        
        team_map = {}
        if latest_round:
            results = self.session.exec(
                select(DriverTeamLink.driver_id, Teams.team_name)
                .join(Teams, DriverTeamLink.team_id == Teams.id)
                .where(
                    DriverTeamLink.season_id == CURRENT_SEASON,
                    DriverTeamLink.round_number == latest_round
                )
            ).all()
            team_map = {driver_id: team_name for driver_id, team_name in results}
        
        result = []
        for driver_dict in enriched_drivers:
            ownership = next((o for o in ownerships if o.driver_id == driver_dict['id']), None)
            
            driver_dict['team_name'] = team_map.get(driver_dict['id'])
            driver_dict['ownership'] = ownership.model_dump() if ownership else None
            driver_dict['isOwned'] = True
            driver_dict['isOwnedByMe'] = True
            driver_dict['isFreeAgent'] = False
            driver_dict['isForSale'] = ownership.is_listed_for_sale if ownership else False
            driver_dict['isLocked'] = self._is_driver_locked(ownership) if ownership else False
            driver_dict['canBuyout'] = False
            driver_dict['ownerName'] = None
            
            result.append(driver_dict)
        
        return result
