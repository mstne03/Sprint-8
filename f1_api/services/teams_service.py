"""Teams service module for teams-related operations"""
import logging
from sqlmodel import Session
from f1_api.models.business.teams_business import TeamsBusinessLogic
from f1_api.models.repositories.teams_repository import TeamsRepository

class TeamsService:
    """Provides teams response"""
    def __init__(self, session: Session):
        self.repository = TeamsRepository(session)
        self.business_logic = TeamsBusinessLogic()
    
    def get_teams_with_season_stats(self):
        """
        Get all teams with their season statistics

        Returns:
            list: Teams with calculated points and rankings
        """
        try:
            teams = self.repository.get_all_teams()
            team_points_data = self.repository.get_team_points_data()

            team_stats = self.business_logic.calculate_team_statistics(team_points_data)
            result = self.business_logic.build_teams_with_stats(teams, team_stats)

            return result
        except Exception as e:
            logging.warning("Teams service execution interrupted: %s", e)
            return []

def get_teams_service(session: Session) -> list:
    """Legacy function wrapper"""
    service = TeamsService(session)
    return service.get_teams_with_season_stats()
