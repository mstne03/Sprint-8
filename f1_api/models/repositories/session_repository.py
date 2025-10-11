from sqlmodel import Session, select

from f1_api.models.f1_schemas import Sessions


class SessionRepository:
    def __init__(self, session: Session, year: int, schedule):
        self.session = session
        self.season = year
        self.schedule = schedule
    
    def get_session_data(self) -> list[Sessions]:
        sessions = []
        existing_sessions = set(self.session.exec(
            select(Sessions.round_number, Sessions.session_number)
        ).all())
        for _,event in self.schedule.iloc[1:].iterrows():
            session_names = [
                event["Session1"],
                event["Session2"],
                event["Session3"],
                event["Session4"],
                event["Session5"]
            ]

            for i, s in enumerate(session_names):
                rn = int(event["RoundNumber"])
                if (rn, i+1) in existing_sessions:
                    continue
                if not rn:
                    continue

                sessions.append(Sessions(
                    round_number = rn,
                    season_id = self.season,
                    session_number = i+1,
                    session_type = str(s)
                ))
        return sessions

def get_session_data(session, year, schedule):
    session_repo = SessionRepository(session,year,schedule)
    return session_repo.get_session_data()