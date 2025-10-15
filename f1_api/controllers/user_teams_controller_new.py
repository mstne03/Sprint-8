"""User Teams Controller with proper MVC structure"""
from datetime import datetime
from sqlmodel import select
from fastapi import HTTPException
from f1_api.controllers.base_controller import BaseController
from f1_api.models.app_models import (
    Users, UserTeams, UserLeagueLink, UserTeamUpdate, UserTeamResponse
)

class UserTeamsController(BaseController):
    """Controller for user teams management with proper transaction handling"""
    
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
                budget_remaining=100_000_000,
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
            constructor_id=team.constructor_id,
            total_points=team.total_points,
            budget_remaining=team.budget_remaining,
            is_active=team.is_active,
            created_at=team.created_at,
            updated_at=team.updated_at
        )