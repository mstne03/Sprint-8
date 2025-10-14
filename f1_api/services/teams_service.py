"""
Teams service module for teams-related business operations.

This module provides the business logic layer for team management operations,
including team statistics calculation, season performance analysis, and team
data aggregation. It integrates with the repository layer to provide comprehensive
team information with calculated metrics and rankings.
"""
import logging
from typing import Dict
from fastf1 import plotting
from sqlmodel import Session
from f1_api.models.repositories.teams_repository import TeamsRepository
from f1_api.services.season_context_service import get_season_context_service
from f1_api.models.f1_schemas import Teams

class TeamsService:
    """
    Service class for managing team business operations.
    
    This service handles team-related business logic including statistics calculation,
    season performance analysis, and data aggregation. It coordinates with the
    TeamsRepository to provide enriched team data with computed metrics.
    
    The service handles:
    - Team statistics calculation from raw data
    - Season performance metrics and rankings
    - Team data enrichment with calculated fields
    - Error handling and data validation
    """
    def __init__(self, session: Session, year: int):
        """
        Initialize the TeamsService with required dependencies.
        
        Sets up the repository access and season context for team operations.
        
        Args:
            session: SQLModel database session for repository operations
            year: Optional year for season-specific data filtering
        """
        self.session = session
        self.context_service = get_season_context_service(session, year)
        self.repository = TeamsRepository(self.session, self.context_service.session_map, self.context_service.schedule)

    def get_team_data(self):
        teams = []
        schedule = self.context_service.schedule
        existing_teams = self.repository.get_existing_teams()
        added_teams = set()
        for _,event in schedule.iloc[1:].iterrows():
            round_number = event["RoundNumber"]
            sessions = [
                event["Session1"],
                event["Session2"],
                event["Session3"],
                event["Session4"],
                event["Session5"]
            ]
            for session_type in sessions:
                try:
                    f1_session = self.context_service.session_map.get((round_number,session_type))
                    if f1_session is None:
                        continue
                    try:
                        team_names = plotting.list_team_names(f1_session)
                    except Exception as e:
                        logging.warning(f'Failed to get team names for round {round_number}, session {session_type}: {e}')
                        continue
                    for name in team_names:
                        if name in existing_teams:
                            continue
                        if name in added_teams:
                            continue
                        added_teams.add(name)
                        try:
                            team_color = plotting.get_team_color(name, f1_session)
                        except Exception as e:
                            logging.warning(f'Failed to get color for team {name}: {e}')
                            team_color = "#FFFFFF"
                        
                        teams.append(Teams(
                            team_name=name,
                            team_color=team_color
                        ))
                except Exception as e:
                    logging.warning(f'Error processing session {session_type} for round {round_number}: {e}')
                    continue
        return teams
    
    def _calculate_team_statistics(self, team_points_data: list) -> Dict[int, Dict]:
        """
        Calculate team statistics from raw points data.
        
        Aggregates points and driver information for each team from the raw
        database results, providing total points and unique driver counts.
        
        Args:
            team_points_data: Raw team points data from repository
            
        Returns:
            Dict mapping team_id to statistics dictionary containing:
                - total_points: Accumulated points for the team
                - drivers: Set of unique driver IDs for the team
        """
        team_stats = {}

        for team_id, driver_id, round_number, round_points in team_points_data:
            if team_id not in team_stats:
                team_stats[team_id] = {
                    "total_points": 0,
                    "drivers": set()
                }
            
            team_stats[team_id]["total_points"] += round_points or 0
            team_stats[team_id]["drivers"].add(driver_id)
        
        return team_stats
    
    def _build_teams_with_stats(self, teams: list[Teams], team_stats: Dict) -> list:
        """
        Combine team data with calculated statistics.
        
        Merges raw team information with calculated statistics, creating
        enriched team objects with season performance metrics and rankings.
        
        Args:
            teams: List of team entities from repository
            team_stats: Calculated statistics dictionary
            
        Returns:
            List of team dictionaries with embedded season results,
            sorted by points in descending order
        """
        result = []
        for team in teams:
            team_dict = team.model_dump()
            stats = team_stats.get(team.id, {"total_points": 0, "drivers": set()})
            team_dict["season_results"] = {
                "points": stats["total_points"],
                "driver_count": len(stats["drivers"])
            }
            result.append(team_dict)
        result.sort(key=lambda t: t["season_results"]["points"], reverse=True)
        return result

    @property
    def get_teams_with_season_stats(self):
        """
        Get all teams with their season statistics.
        
        Retrieves team data from the repository and enriches it with calculated
        season performance metrics including total points and driver counts.
        Teams are returned sorted by total points in descending order.

        Returns:
            list: Teams with calculated points and rankings, empty list on error
            
        Raises:
            Logs warning on database or calculation errors, returns empty list
        """
        try:
            teams = self.repository.get_all_teams()
            team_points_data = self.repository.get_team_points_data()
            team_stats = self._calculate_team_statistics(team_points_data)
            result = self._build_teams_with_stats(teams, team_stats)

            return result
        except Exception as e:
            logging.warning("Teams service execution interrupted: %s", e)
            return []

def get_teams_service(session: Session, year: int = None) -> list:
    """Simplified function wrapper"""
    service = TeamsService(session, year)
    return service.get_teams_with_season_stats

def get_team_data():
    return ""