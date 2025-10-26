from sqlmodel import Session, select, func
from f1_api.models.f1_schemas import DriverTeamLink, Teams

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
    
    def get_driver_team_map(self, season_year: int) -> dict[int, str]:
        """
        Get a mapping of driver_id -> team_name for the latest round of a season.
        
        Args:
            season_year: The season year to get the mapping for
        
        Returns:
            dict mapping driver IDs to team names
        """
        latest_round = self.get_latest_round_for_season(season_year)
        
        if not latest_round:
            return {}
        
        results = self.session.exec(
            select(DriverTeamLink.driver_id, Teams.team_name)
            .join(Teams, DriverTeamLink.team_id == Teams.id)
            .where(
                DriverTeamLink.season_id == season_year,
                DriverTeamLink.round_number == latest_round
            )
        ).all()
        
        return {driver_id: team_name for driver_id, team_name in results}
