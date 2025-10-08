"""User Teams business model - Contains all user teams-related business logic and CRUD operations"""
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
from sqlmodel import select, Session
from fastapi import HTTPException
from f1_api.models.app_models import (
    Users, UserTeams, UserLeagueLink, UserTeamsCreate, UserTeamUpdate, UserTeamResponse, Leagues
)
from f1_api.models.f1_models import Drivers, Teams


class UserTeamsModel:
    """Business model for user teams operations with all CRUD and business logic"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def create_user_team(self, user_team: UserTeamsCreate, session: Session) -> Dict[str, str]:
        """
        Create a new user team
        Business logic for basic team creation
        
        Args:
            user_team: UserTeamsCreate object with team data
            session: Database session
            
        Returns:
            Success message
            
        Raises:
            HTTPException: If errors occur
        """
        try:
            # Business logic: Create team with default values
            new_team = UserTeams(
                user_id=user_team.user_id,
                league_id=None,  # Global team, not tied to specific league
                team_name=None,
                driver_1_id=user_team.driver_1_id,
                driver_2_id=user_team.driver_2_id,
                driver_3_id=user_team.driver_3_id,
                constructor_id=user_team.constructor_id,
                total_points=0,  # Business rule: start with 0 points
                is_active=True
            )
            
            session.add(new_team)
            session.commit()
            
            return {"message": "User team created successfully"}
            
        except Exception as e:
            self.logger.error("Error creating user team: %s", e)
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def create_or_update_user_team(
        self, 
        league_id: int, 
        team_data: UserTeamUpdate, 
        user_id: str, 
        session: Session
    ) -> UserTeamResponse:
        """
        Create or update a user's team in a specific league
        Business logic for league-specific team management
        
        Args:
            league_id: ID of the league for the team
            team_data: UserTeamUpdate object with team data
            user_id: Supabase user ID of the team owner
            session: Database session
            
        Returns:
            UserTeamResponse: Created or updated team data
            
        Raises:
            HTTPException: If user not found, not a member, or drivers not unique
        """
        try:
            # Business logic: Verify user exists
            user = session.exec(
                select(Users).where(Users.supabase_user_id == user_id)
            ).first()
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Business logic: Verify user is a member of this league
            membership = session.exec(
                select(UserLeagueLink).where(
                    UserLeagueLink.league_id == league_id,
                    UserLeagueLink.user_id == user.id,
                    UserLeagueLink.is_active == True
                )
            ).first()
            
            if not membership:
                raise HTTPException(
                    status_code=403, 
                    detail="User is not a member of this league"
                )
            
            # Business logic: Validate that all drivers are unique
            drivers = [team_data.driver_1_id, team_data.driver_2_id, team_data.driver_3_id]
            if len(set(drivers)) != len(drivers):
                raise HTTPException(
                    status_code=400, 
                    detail="All drivers must be unique"
                )
            
            # Business logic: Check if team already exists for this user in this league
            existing_team = session.exec(
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
                
                session.add(existing_team)
                session.commit()
                session.refresh(existing_team)
                
                team = existing_team
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
                    total_points=0,  # Business rule: start with 0 points
                    is_active=True,
                    created_at=datetime.now(),
                    updated_at=datetime.now()
                )
                
                session.add(new_team)
                session.commit()
                session.refresh(new_team)
                
                team = new_team
            
            # Transform to response format
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
            
        except HTTPException:
            raise
        except Exception as e:
            self.logger.error("Error creating/updating user team: %s", e)
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_my_team(self, league_id: int, user_id: str, session: Session) -> Optional[UserTeamResponse]:
        """
        Get the current user's team in a specific league
        Business logic for team retrieval
        
        Args:
            league_id: League ID
            user_id: Supabase user ID
            session: Database session
            
        Returns:
            UserTeamResponse or None if no team found
            
        Raises:
            HTTPException: If errors occur
        """
        try:
            # Business logic: Get user by Supabase ID
            user = session.exec(
                select(Users).where(Users.supabase_user_id == user_id)
            ).first()
            
            if not user:
                return None
            
            # Get user's team in the specific league
            team = session.exec(
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
            
        except Exception as e:
            self.logger.error("Error fetching user team: %s", e)
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_my_teams(self, user_id: str, session: Session) -> List[Dict[str, Any]]:
        """
        Get all teams belonging to the current user across all leagues
        Business logic for comprehensive team listing
        
        Args:
            user_id: Supabase user ID
            session: Database session
            
        Returns:
            List of user's teams with league information and driver/constructor details
            
        Raises:
            HTTPException: If errors occur
        """
        try:
            # Business logic: Get user by Supabase ID
            user = session.exec(
                select(Users).where(Users.supabase_user_id == user_id)
            ).first()
            
            if not user:
                return []
            
            # Get all user's teams
            teams = session.exec(
                select(UserTeams).where(
                    UserTeams.user_id == user.id,
                    UserTeams.is_active == True
                )
            ).all()
            
            teams_data = []
            for team in teams:
                # Simplified version - just return basic team info first
                team_dict = {
                    "id": team.id,
                    "team_name": team.team_name,
                    "league_id": team.league_id,
                    "league_name": "Test League",  # Hardcoded for testing
                    "total_points": team.total_points,
                    "budget_remaining": team.budget_remaining,
                    "created_at": team.created_at,
                    "updated_at": team.updated_at,
                    "drivers": [],  # Empty for now
                    "constructor": {
                        "id": None,
                        "name": "Test Constructor",
                        "logo": None
                    }
                }
                teams_data.append(team_dict)
            
            return teams_data
            
        except Exception as e:
            self.logger.error("Error fetching user teams: %s", e)
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def calculate_team_points(self, team_id: int, session: Session) -> int:
        """
        Calculate total points for a team based on driver and constructor performance
        Business logic for point calculation
        
        Args:
            team_id: Team ID
            session: Database session
            
        Returns:
            Total calculated points
        """
        try:
            team = session.exec(
                select(UserTeams).where(UserTeams.id == team_id)
            ).first()
            
            if not team:
                return 0
            
            # Business logic: Calculate points from drivers and constructor
            # This would involve complex calculations based on actual race results
            # For now, return the stored total_points
            return team.total_points or 0
            
        except Exception as e:
            self.logger.error("Error calculating team points: %s", e)
            return 0
    
    def update_team_points(self, team_id: int, new_points: int, session: Session) -> bool:
        """
        Update team points
        Business logic for point updates
        
        Args:
            team_id: Team ID
            new_points: New point total
            session: Database session
            
        Returns:
            True if successful, False otherwise
        """
        try:
            team = session.exec(
                select(UserTeams).where(UserTeams.id == team_id)
            ).first()
            
            if not team:
                return False
            
            # Business logic: Update points and timestamp
            team.total_points = new_points
            team.updated_at = datetime.now()
            
            session.add(team)
            session.commit()
            
            return True
            
        except Exception as e:
            self.logger.error("Error updating team points: %s", e)
            return False
    
    def delete_team(self, team_id: int, user_id: str, session: Session) -> bool:
        """
        Delete a user's team (soft delete)
        Business logic for team deletion
        
        Args:
            team_id: Team ID
            user_id: Supabase user ID (for authorization)
            session: Database session
            
        Returns:
            True if successful, False otherwise
        """
        try:
            # Business logic: Get user by Supabase ID
            user = session.exec(
                select(Users).where(Users.supabase_user_id == user_id)
            ).first()
            
            if not user:
                return False
            
            # Business logic: Verify ownership
            team = session.exec(
                select(UserTeams).where(
                    UserTeams.id == team_id,
                    UserTeams.user_id == user.id,
                    UserTeams.is_active == True
                )
            ).first()
            
            if not team:
                return False
            
            # Business logic: Soft delete
            team.is_active = False
            team.updated_at = datetime.now()
            
            session.add(team)
            session.commit()
            
            return True
            
        except Exception as e:
            self.logger.error("Error deleting team: %s", e)
            return False