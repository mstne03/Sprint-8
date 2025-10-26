from sqlmodel import Session, select
from f1_api.models.f1_schemas import Sessions

class SessionRepository:
    def __init__(self, session: Session, year: int):
        self.session = session
        self.season = year
    
    def get_existing_sessions(self):
        return set(self.session.exec(
            select(Sessions.round_number, Sessions.session_number)
        ).all())
