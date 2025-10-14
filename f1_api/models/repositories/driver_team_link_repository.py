from sqlmodel import Session, select
from f1_api.models.f1_schemas import DriverTeamLink

class DriverTeamLinkRepository:
    def __init__(self, session: Session):
        self.session = session
    def get_current_driver_team_links(self):
        return list(self.session.exec(select(DriverTeamLink)))
    def get_existing_links(self):
        return set(self.session.exec(select(DriverTeamLink.driver_id, DriverTeamLink.team_id)).all())
