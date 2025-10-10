"""Gets Teams data from the DB"""
from sqlmodel import Session, select, func
from f1_api.models.f1_models import DriverTeamLink, SessionResult, Teams

class TeamsRepository:
    """Encapsulates DB logic"""
    def __init__(self, session: Session):
        self.session = session
    
    def get_all_teams(self) -> list[Teams]:
        """Get all of the teams from the DB"""
        return self.session.exec(select(Teams)).all()
    
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