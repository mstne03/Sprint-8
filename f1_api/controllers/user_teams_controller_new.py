"""User Teams Controller with proper MVC structure"""
from datetime import datetime
from sqlmodel import select
from fastapi import HTTPException
from f1_api.controllers.base_controller import BaseController
from f1_api.models.app_models import (
    Users, UserTeams, UserLeagueLink, UserTeamUpdate, UserTeamResponse
)
from f1_api.models.f1_schemas import Drivers, Teams, SessionResult

class UserTeamsController(BaseController):
    """Controller for user teams management with proper transaction handling"""
    
    INITIAL_BUDGET = 100_000_000  # 100M initial budget
    
    def _calculate_driver_price(self, driver_id: int) -> int:
        """
        Calculate driver price based on season performance
        Formula: 1M + (points × 1000) + (podiums × 5000) + (victories × 10000)
        Same formula as frontend fantasy_stats.price
        
        Args:
            driver_id: ID of the driver
            
        Returns:
            int: Calculated price for the driver
        """
        # Get driver's season results
        results = self.session.exec(
            select(SessionResult).where(SessionResult.driver_id == driver_id)
        ).all()
        
        # Calculate stats
        total_points = 0
        podiums = 0
        victories = 0
        
        for result in results:
            if result.points:
                total_points += result.points
            
            # Race session (session_number == 5)
            if result.session_number == 5:
                if result.position == "1":
                    victories += 1
                    podiums += 1
                elif result.position in ["2", "3"]:
                    podiums += 1
        
        # Calculate price using same formula as frontend
        price = round(1_000_000 + (total_points * 1000) + (podiums * 5000) + (victories * 10000), 0)
        
        return int(price)
    
    def _calculate_budget_remaining(
        self, 
        driver_1_id: int, 
        driver_2_id: int, 
        driver_3_id: int, 
        constructor_id: int
    ) -> int:
        """
        Calculate remaining budget based on selected drivers and constructor prices
        
        Args:
            driver_1_id: ID of first driver
            driver_2_id: ID of second driver
            driver_3_id: ID of third driver
            constructor_id: ID of constructor
            
        Returns:
            int: Remaining budget after purchasing drivers and constructor
            
        Raises:
            HTTPException: If any driver or constructor not found, or budget exceeded
        """
        # Get driver prices
        # Query each driver individually
        driver_1 = self.session.exec(select(Drivers).where(Drivers.id == driver_1_id)).first()
        driver_2 = self.session.exec(select(Drivers).where(Drivers.id == driver_2_id)).first()
        driver_3 = self.session.exec(select(Drivers).where(Drivers.id == driver_3_id)).first()
        
        drivers = [driver_1, driver_2, driver_3]
        
        if not all(drivers):
            missing = []
            if not driver_1:
                missing.append(driver_1_id)
            if not driver_2:
                missing.append(driver_2_id)
            if not driver_3:
                missing.append(driver_3_id)
            raise HTTPException(
                status_code=404, 
                detail=f"Drivers not found with IDs: {missing}"
            )
        
        # Get constructor price
        constructor = self.session.exec(
            select(Teams).where(Teams.id == constructor_id)
        ).first()
        
        if not constructor:
            raise HTTPException(status_code=404, detail="Constructor not found")
        
        # Calculate total cost
        driver_costs = []
        for driver in drivers:
            # Calculate price based on performance stats
            cost = self._calculate_driver_price(driver.id)
            driver_costs.append(cost)
            print(f"Driver {driver.full_name}: ${cost / 1_000_000:.1f}M")
        
        total_driver_cost = sum(driver_costs)
        print(f"Total driver cost: ${total_driver_cost / 1_000_000:.1f}M")
        
        # Teams don't have price in current schema, default to 0 for now
        # TODO: Add team pricing when market system is fully implemented
        constructor_cost = 0
        
        total_cost = total_driver_cost + constructor_cost
        budget_remaining = self.INITIAL_BUDGET - total_cost
        
        print(f"Budget calculation: {self.INITIAL_BUDGET / 1_000_000:.1f}M - {total_cost / 1_000_000:.1f}M = {budget_remaining / 1_000_000:.1f}M")
        
        # Validate budget
        if budget_remaining < 0:
            raise HTTPException(
                status_code=400, 
                detail=f"Budget exceeded. Total cost: ${total_cost / 1_000_000:.1f}M, Budget: ${self.INITIAL_BUDGET / 1_000_000:.1f}M"
            )
        
        return budget_remaining
    
    def create_or_update_team(
        self, 
        league_id: int, 
        team_data: UserTeamUpdate, 
        user_id: str
    ) -> UserTeamResponse:
        """
        Create or update a user's team in a specific league
        
        Args:
            league_id: ID of the league for the team
            team_data: UserTeamUpdate object with team data
            user_id: Supabase user ID of the team owner
            
        Returns:
            UserTeamResponse: Created or updated team object
            
        Raises:
            HTTPException: If user not found, not a member, or drivers not unique
        """
        # Verify user exists
        user = self.session.exec(
            select(Users).where(Users.supabase_user_id == user_id)
        ).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Verify user is a member of this league
        membership = self.session.exec(
            select(UserLeagueLink).where(
                UserLeagueLink.league_id == league_id,
                UserLeagueLink.user_id == user.id,
                UserLeagueLink.is_active == True
            )
        ).first()
        
        if not membership:
            raise HTTPException(status_code=403, detail="Access denied: You are not a member of this league")
        
        # Validate drivers are unique
        driver_ids = [team_data.driver_1_id, team_data.driver_2_id, team_data.driver_3_id]
        if len(set(driver_ids)) != 3:
            raise HTTPException(status_code=400, detail="All drivers must be unique")
        
        # Calculate budget remaining based on driver and constructor prices
        budget_remaining = self._calculate_budget_remaining(
            team_data.driver_1_id,
            team_data.driver_2_id,
            team_data.driver_3_id,
            team_data.constructor_id
        )
        
        # Check if user already has a team in this league
        existing_team = self.session.exec(
            select(UserTeams).where(
                UserTeams.user_id == user.id,
                UserTeams.league_id == league_id,
                UserTeams.is_active == True
            )
        ).first()
        
        if existing_team:
            # Update existing team
            existing_team.team_name = team_data.team_name
            existing_team.driver_1_id = team_data.driver_1_id
            existing_team.driver_2_id = team_data.driver_2_id
            existing_team.driver_3_id = team_data.driver_3_id
            existing_team.constructor_id = team_data.constructor_id
            existing_team.budget_remaining = budget_remaining  # ✅ Update budget
            existing_team.updated_at = datetime.now()
            
            self.session.add(existing_team)
            # Note: Commit handled by context manager
            
            return UserTeamResponse(
                id=existing_team.id,
                user_id=existing_team.user_id,
                league_id=existing_team.league_id,
                team_name=existing_team.team_name,
                driver_1_id=existing_team.driver_1_id,
                driver_2_id=existing_team.driver_2_id,
                driver_3_id=existing_team.driver_3_id,
                constructor_id=existing_team.constructor_id,
                total_points=existing_team.total_points,
                budget_remaining=existing_team.budget_remaining,
                is_active=existing_team.is_active,
                created_at=existing_team.created_at,
                updated_at=existing_team.updated_at
            )
        else:
            # Create new team
            new_team = UserTeams(
                user_id=user.id,
                league_id=league_id,
                team_name=team_data.team_name,
                driver_1_id=team_data.driver_1_id,
                driver_2_id=team_data.driver_2_id,
                driver_3_id=team_data.driver_3_id,
                constructor_id=team_data.constructor_id,
                total_points=0,
                budget_remaining=budget_remaining,  # ✅ Use calculated budget
                is_active=True
            )
            
            self.session.add(new_team)
            self.session.flush()  # Flush to get the ID
            
            return UserTeamResponse(
                id=new_team.id,
                user_id=new_team.user_id,
                league_id=new_team.league_id,
                team_name=new_team.team_name,
                driver_1_id=new_team.driver_1_id,
                driver_2_id=new_team.driver_2_id,
                driver_3_id=new_team.driver_3_id,
                constructor_id=new_team.constructor_id,
                total_points=new_team.total_points,
                budget_remaining=new_team.budget_remaining,
                is_active=new_team.is_active,
                created_at=new_team.created_at,
                updated_at=new_team.updated_at
            )
    
    def get_my_team(self, league_id: int, user_id: str) -> UserTeamResponse | None:
        """
        Get the current user's team in a specific league
        
        Args:
            league_id: ID of the league to get team from
            user_id: Supabase user ID of the team owner
            
        Returns:
            UserTeamResponse | None: User's team in the league or None if no team exists
        """
        # Verify user exists
        user = self.session.exec(
            select(Users).where(Users.supabase_user_id == user_id)
        ).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get user's team in this league
        team = self.session.exec(
            select(UserTeams).where(
                UserTeams.user_id == user.id,
                UserTeams.league_id == league_id,
                UserTeams.is_active == True
            )
        ).first()
        
        if not team:
            return None
            
        return UserTeamResponse(
            id=team.id,
            user_id=team.user_id,
            league_id=team.league_id,
            team_name=team.team_name,
            driver_1_id=team.driver_1_id,
            driver_2_id=team.driver_2_id,
            driver_3_id=team.driver_3_id,
            reserve_driver_id=team.reserve_driver_id,
            constructor_id=team.constructor_id,
            total_points=team.total_points,
            budget_remaining=team.budget_remaining,
            is_active=team.is_active,
            created_at=team.created_at,
            updated_at=team.updated_at
        )