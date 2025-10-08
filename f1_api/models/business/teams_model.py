"""Teams business model - Contains all teams-related business logic and CRUD operations"""
import logging
from typing import List, Dict, Any
from sqlmodel import Session, select, func
from f1_api.models.f1_models import DriverTeamLink, SessionResult, Teams
from f1_api.season.utils.ingest import get_teams_mapped


class TeamsModel:
    """Business model for teams operations with all CRUD and business logic"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def get_all_teams_with_points(self, session: Session) -> List[Dict[str, Any]]:
        """
        Get all teams for the current season from the DB with accumulated points
        Contains all business logic for calculating team statistics and points
        
        Args:
            session: Database session
            
        Returns:
            List of teams with calculated points and statistics
        """
        try:
            teams = []
        
            # Get all teams from database
            all_teams = session.exec(select(Teams)).all()
            
            # OPTIMIZED: Single query to get ALL necessary data
            # Instead of N individual SQL queries per driver-round
            team_points_data = session.exec(
                select(
                    DriverTeamLink.team_id,
                    DriverTeamLink.driver_id,
                    DriverTeamLink.round_number,
                    func.sum(SessionResult.points).label("round_points")
                )
                .join(SessionResult,
                    (SessionResult.driver_id == DriverTeamLink.driver_id) &
                    (SessionResult.round_number == DriverTeamLink.round_number))
                .group_by(
                    DriverTeamLink.team_id,
                    DriverTeamLink.driver_id,
                    DriverTeamLink.round_number
                )
            ).all()
            
            # Process data in memory (much faster than individual queries)
            team_stats = {}
            
            for team_id, driver_id, _, round_points in team_points_data:
                if team_id not in team_stats:
                    team_stats[team_id] = {
                        "total_points": 0,
                        "drivers": set()
                    }
                
                team_stats[team_id]["total_points"] += round_points or 0
                team_stats[team_id]["drivers"].add(driver_id)
            
            # Build final result with business logic
            for team in all_teams:
                team_dict = team.model_dump()
                stats = team_stats.get(team.id, {"total_points": 0, "drivers": set()})
                
                team_dict["season_results"] = {
                    "points": stats["total_points"],
                    "driver_count": len(stats["drivers"])
                }
                
                teams.append(team_dict)
            
            # Sort teams by points (highest to lowest) - business rule
            teams.sort(key=lambda team: team["season_results"]["points"], reverse=True)
            
            return teams
            
        except Exception as e:
            self.logger.warning("Teams model execution interrupted: %s", e)
            return []
    
    def get_teams_mapped_data(self, session: Session) -> Dict[str, Any]:
        """
        Get teams mapped data from FastF1 integration
        Business logic for FastF1 data transformation
        
        Args:
            session: Database session
            
        Returns:
            Mapped teams data from FastF1
        """
        try:
            return get_teams_mapped(session)
        except Exception as e:
            self.logger.error("Error getting teams mapped data: %s", e)
            raise
    
    def calculate_team_championship_position(self, session: Session, team_id: int) -> int:
        """
        Calculate current championship position for a specific team
        Business logic for championship standings
        
        Args:
            session: Database session
            team_id: Team ID
            
        Returns:
            Championship position (1-based)
        """
        try:
            teams_with_points = self.get_all_teams_with_points(session)
            
            for position, team in enumerate(teams_with_points, 1):
                if team.get("id") == team_id:
                    return position
            
            return len(teams_with_points) + 1  # If team not found, put at end
            
        except Exception as e:
            self.logger.error("Error calculating team championship position: %s", e)
            return 0
    
    def get_team_by_id(self, session: Session, team_id: int) -> Dict[str, Any]:
        """
        Get specific team by ID with all related data
        CRUD operation with business logic
        
        Args:
            session: Database session
            team_id: Team ID
            
        Returns:
            Team data with statistics
        """
        try:
            team = session.exec(select(Teams).where(Teams.id == team_id)).first()
            
            if not team:
                return {}
            
            # Get team statistics
            all_teams = self.get_all_teams_with_points(session)
            team_with_stats = next((t for t in all_teams if t.get("id") == team_id), {})
            
            return team_with_stats
            
        except Exception as e:
            self.logger.error("Error fetching team by ID %s: %s", team_id, e)
            return {}
    
    def get_team_drivers(self, session: Session, team_id: int, season_id: int = None) -> List[Dict[str, Any]]:
        """
        Get all drivers for a specific team in a season
        Business logic for team-driver relationships
        
        Args:
            session: Database session
            team_id: Team ID
            season_id: Season ID (optional, defaults to current)
            
        Returns:
            List of drivers in the team
        """
        try:
            query = select(DriverTeamLink).where(DriverTeamLink.team_id == team_id)
            
            if season_id:
                query = query.where(DriverTeamLink.season_id == season_id)
            
            driver_links = session.exec(query).all()
            
            # Get unique drivers
            driver_ids = list(set(link.driver_id for link in driver_links))
            
            return driver_ids
            
        except Exception as e:
            self.logger.error("Error fetching team drivers: %s", e)
            return []