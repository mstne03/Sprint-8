from sqlmodel import Session
from f1_api.controllers.season_context_controller import SeasonContextController
from f1_api.models.f1_schemas import Sessions
from f1_api.models.repositories.session_repository import SessionRepository

class SessionController:
    def __init__(self, session: Session, year: int):
        self.season = year
        self.repository = SessionRepository(session,year)
        self.season_context = SeasonContextController(session)

    def get_session_data(self):
        sessions = []
        existing_sessions = self.repository.get_existing_sessions()
        session_types_by_rn = self.season_context.session_types_by_rn
        for round_number, session_types in session_types_by_rn.items():
            for i, session in enumerate(session_types, start=1):
                if (round_number, i) in existing_sessions:
                    continue
                sessions.append(Sessions(
                    round_number=round_number,
                    season_id=self.season,
                    session_number=i,
                    session_type=session
                ))
        return sessions

def get_session_data(session,year):
    session_controller = SessionController(session,year)
    return session_controller.get_session_data()
