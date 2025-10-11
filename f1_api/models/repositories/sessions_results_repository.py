"""Gets Teams data from the DB"""
from sqlmodel import Session, select
from f1_api.models.f1_schemas import SessionResult

class SessionResultsRepository:
    def __init__(self, session:Session):
        self.session = session
    
    def get_registered_rounds(self):
        return set(self.session.exec(select(SessionResult.round_number)).all())

def get_all_registered_rounds(session):
    session_results = SessionResultsRepository(session=session)
    return session_results.get_registered_rounds()