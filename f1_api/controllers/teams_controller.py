"""
Teams controller module for teams-related business operations.

This module provides the business logic layer for team management operations,
including team statistics calculation, season performance analysis, and team
data aggregation. It integrates with the repository layer to provide comprehensive
team information with calculated metrics and rankings.
"""
import logging
from typing import Dict
from fastf1 import plotting
from sqlmodel import Session
from fastapi import HTTPException
from f1_api.models.repositories.teams_repository import TeamsRepository
from f1_api.controllers.season_context_controller import get_season_context_service
from f1_api.models.f1_schemas import Teams

class TeamsController:
    """
    Controller class for managing team business operations.
    
    This controller handles team-related business logic including statistics calculation,
    season performance analysis, and data aggregation. It coordinates with the
    TeamsRepository to provide enriched team data with computed metrics.
    
    The controller handles:
    - Team statistics calculation from raw data
    - Season performance metrics and rankings
    - Team data enrichment with calculated fields
    - Error handling and data validation
    """
    def __init__(self, session: Session):
        """
        Initialize the TeamsService with required dependencies.
        
        Sets up the repository access and season context for team operations.
        
        Args:
            session: SQLModel database session for repository operations
            year: Optional year for season-specific data filtering
        """
        self.session = session
        self.context_service = get_season_context_service(session)
        self.repository = TeamsRepository(self.session, self.context_service.session_map, self.context_service.schedule)

    def _validate_dependencies(self) -> None:
        """
        Validate that all required dependencies are properly initialized.
        
        Raises:
            HTTPException: If repository or context service are not initialized
        """
        if not self.repository:
            logging.error("Repository not initialized in TeamsService")
            raise HTTPException(
                status_code=500,
                detail="Internal server error: Repository not properly initialized"
            )
            
        if not self.context_service:
            logging.error("Context service not initialized in TeamsService")
            raise HTTPException(
                status_code=500,
                detail="Internal server error: Context service not properly initialized"
            )

    def _get_existing_teams_safely(self) -> set:
        """
        Safely retrieve existing teams from repository with error handling.
        
        Returns:
            set: Set of existing team names, empty set if none found
            
        Raises:
            HTTPException: If database access fails
        """
        try:
            existing_teams = self.repository.get_existing_teams()
            if existing_teams is None:
                logging.warning("Repository returned None for existing teams, using empty set")
                return set()
            return existing_teams
        except Exception as e:
            logging.error(f"Database error while fetching existing teams: {e}")
            raise HTTPException(
                status_code=503,
                detail="Service temporarily unavailable: Unable to access team data"
            )

    def _get_session_types_safely(self) -> dict:
        """
        Safely retrieve session types mapping from context service.
        
        Returns:
            dict: Mapping of round numbers to session types
            
        Raises:
            HTTPException: If context service access fails or no data available
        """
        try:
            session_types_by_rn = self.context_service.session_types_by_rn
            if not session_types_by_rn:
                logging.warning("No session types available from context service")
                raise HTTPException(
                    status_code=404,
                    detail="No session data available for the requested season"
                )
            return session_types_by_rn
        except HTTPException:
            raise
        except Exception as e:
            logging.error(f"Context service error while fetching session types: {e}")
            raise HTTPException(
                status_code=503,
                detail="Service temporarily unavailable: Unable to access season context"
            )

    def _get_team_color_safely(self, team_name: str, f1_session) -> str:
        """
        Safely retrieve team color with fallback handling.
        
        Args:
            team_name: Name of the team
            f1_session: F1 session object
            
        Returns:
            str: Team color hex code, defaults to white if unavailable
        """
        try:
            return plotting.get_team_color(team_name, f1_session)
        except ValueError as e:
            logging.warning(f'Invalid team color data for team {team_name}: {e}')
            return "#FFFFFF"
        except AttributeError as e:
            logging.warning(f'Team color format error for team {team_name}: {e}')
            return "#FFFFFF"
        except Exception as e:
            logging.warning(f'Unexpected error getting color for team {team_name}: {e}')
            return "#FFFFFF"

    def _create_team_object_safely(self, team_name: str, team_color: str) -> Teams | None:
        """
        Safely create a Teams object with error handling.
        
        Args:
            team_name: Name of the team
            team_color: Team color hex code
            
        Returns:
            Teams | None: Teams object if successful, None if creation fails
        """
        try:
            return Teams(team_name=team_name, team_color=team_color)
        except ValueError as e:
            logging.error(f'Invalid team data for {team_name}: {e}')
            return None
        except Exception as e:
            logging.error(f'Failed to create team object for {team_name}: {e}')
            return None

    def _process_session_for_teams(self, round_number: int, session_type: str, 
                                 existing_teams: set, added_teams: set) -> list[Teams]:
        """
        Process a single session to extract team data.
        
        Args:
            round_number: Round number for the session
            session_type: Type of session (e.g., 'FP1', 'Q', 'R')
            existing_teams: Set of already existing team names
            added_teams: Set of team names already processed in this operation
            
        Returns:
            list[Teams]: List of new team objects found in this session
        """
        session_teams = []
        
        try:
            f1_session = self.context_service.session_map.get((round_number, session_type))
            if f1_session is None:
                return session_teams
                
            try:
                team_names = plotting.list_team_names(f1_session)
            except ValueError as e:
                logging.warning(f'Invalid session data for round {round_number}, session {session_type}: {e}')
                return session_teams
            except AttributeError as e:
                logging.warning(f'Session data format error for round {round_number}, session {session_type}: {e}')
                return session_teams
            except Exception as e:
                logging.error(f'Unexpected error getting team names for round {round_number}, session {session_type}: {e}')
                return session_teams
            
            for name in team_names:
                if name in existing_teams or name in added_teams:
                    continue
                    
                added_teams.add(name)
                team_color = self._get_team_color_safely(name, f1_session)
                team_object = self._create_team_object_safely(name, team_color)
                
                if team_object:
                    session_teams.append(team_object)
                    
        except KeyError as e:
            logging.warning(f'Session mapping error for round {round_number}, session {session_type}: {e}')
        except Exception as e:
            logging.error(f'Unexpected error processing session {session_type} for round {round_number}: {e}')
            
        return session_teams

    @property
    def all_teams(self) -> list[Teams]:
        """
        Get all teams discovered from season data with comprehensive error handling.
        
        Processes all available sessions to discover team information including
        team names and colors. Validates data integrity and handles various
        error conditions gracefully.
        
        Returns:
            list[Teams]: List of team objects with names and colors
            
        Raises:
            HTTPException: For critical errors (500, 503, 404)
        """
        self._validate_dependencies()
        
        teams = []
        existing_teams = self._get_existing_teams_safely()
        session_types_by_rn = self._get_session_types_safely()
        added_teams = set()
        
        for round_number, session_types in session_types_by_rn.items():
            for session_type in session_types:
                session_teams = self._process_session_for_teams(
                    round_number, session_type, existing_teams, added_teams
                )
                teams.extend(session_teams)
                
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
        
    @property
    def team_id_map(self):
        all_teams = self.repository.get_all_teams()
        return {team.team_name: team.id for team in all_teams}

def get_teams_service(session: Session) -> list:
    """Simplified function wrapper"""
    controller = TeamsController(session)
    return controller.get_teams_with_season_stats

def get_team_data(session: Session) -> list[Teams]:
    """Function wrapper for getting a list of teams for the DB"""
    controller = TeamsController(session)
    return controller.all_teams

def get_team_id_map(session: Session) -> dict:
    controller = TeamsController(session)
    return controller.team_id_map