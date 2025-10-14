"""Gets Teams data from the DB"""
import logging
from fastf1 import plotting
from sqlmodel import Session, select, func
from f1_api.models.f1_schemas import DriverTeamLink, SessionResult, Teams

class TeamsRepository:
    """Encapsulates DB logic for the Teams entity"""
    def __init__(self, session: Session, session_map, schedule):
        self.session = session
        self.session_map = session_map
        self.schedule = schedule
    
    def get_all_teams(self) -> list[Teams]:
        teams = list(self.session.exec(select(Teams)))
        return teams

    def get_team_id_map(self) -> dict:
        """Get all of the teams from the DB"""
        all_teams = list(self.session.exec(select(Teams)))
        team_id_map = {team.team_name: team.id for team in all_teams}
        return team_id_map
    
    def get_existing_teams(self) -> list[Teams]:
        return set(self.session.exec(
            select(Teams.team_name)
        ).all())
    
    def get_team_points_data(self) -> list:
        """Get aggregated points data for all teams"""
        return self.session.exec(
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

def get_team_id_map(session,session_map,schedule):
    teams_repo = TeamsRepository(session,session_map,schedule)
    return teams_repo.get_team_id_map()
