from sqlmodel import Session, select
from f1_api.models.f1_schemas import Events

class EventsRepository:
    def __init__(self, session: Session, year: int):
        self.session = session
        self.season = year
    
    def get_round_numbers(self):
        return set(self.session.exec(
            select(Events.round_number)
        ).all())
