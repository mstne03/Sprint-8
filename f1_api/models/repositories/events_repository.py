"""This module gets and pushes events modifications into the DB"""
from sqlmodel import Session, select
from f1_api.models.f1_models import Events, SessionResult

class EventsRepository:
    """Repository for the Events DB Table"""
    def __init__(self, session: Session):
        self.session = session

    @staticmethod
    def get_existing_rounds(self) -> list[Events]:
        """This method returns all of the SessionResult models from the DB"""
        return self.session.exec(select(SessionResult.round_number)).all()