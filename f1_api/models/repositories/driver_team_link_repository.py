from sqlmodel import Session, select, func
from f1_api.models.f1_schemas import DriverTeamLink

class DriverTeamLinkRepository:
    def __init__(self, session: Session):
        self.session = session
    
    def get_current_driver_team_links(self):
        return list(self.session.exec(select(DriverTeamLink)))
    
    def get_existing_links(self):
        return set(self.session.exec(select(DriverTeamLink.driver_id, DriverTeamLink.team_id, DriverTeamLink.round_number)).all())
    
    def get_latest_round_for_season(self, season_year: int) -> int | None:
        """Get the latest round number for a given season"""
        result = self.session.exec(
            select(func.max(DriverTeamLink.round_number))
            .where(DriverTeamLink.season_id == season_year)
        ).first()
        return result
    
    def get_links_by_round(self, season_year: int, round_number: int) -> list[DriverTeamLink]:
        """Get all driver-team links for a specific season and round"""
        return list(self.session.exec(
            select(DriverTeamLink)
            .where(
                DriverTeamLink.season_id == season_year,
                DriverTeamLink.round_number == round_number
            )
        ))
