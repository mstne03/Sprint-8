"""Gets Teams data from the DB"""
from sqlmodel import Session, select
from f1_api.models.f1_models import SessionResult

class SessionResultsRepository:
    def __init__(self, session:Session):
        self.session = session
    
    def get_registered_rounds(self):
        return set(self.session.exec(select(SessionResult)).all())

def get_all_registered_rounds():
    return SessionResultsRepository.get_registered_rounds(SessionResultsRepository)