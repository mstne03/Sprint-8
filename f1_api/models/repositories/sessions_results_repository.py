"""Gets Teams data from the DB"""
from sqlmodel import Session, func, select
from f1_api.models.f1_schemas import Drivers, SessionResult, Sessions

class SessionResultsRepository:
    def __init__(self, year: int, session: Session, session_map=None, session_types_by_rn=None):
        self.season = year
        self.session = session
        self.session_map = session_map
        self.session_types_by_rn = session_types_by_rn
    def get_registered_rounds(self):
        return set(self.session.exec(select(SessionResult.round_number)).all())
    def get_registered_results(self):
        existing_results_query = self.session.exec(
            select(SessionResult.round_number, SessionResult.session_number, SessionResult.driver_id)
        ).all()
        return set((result.round_number, result.session_number, result.driver_id) for result in existing_results_query)
    def get_driver_results(self):
        max_round = self.session.exec(
            select(func.max(SessionResult.round_number))
        ).one()
        sprint_rounds = self.session.exec(
            select(Sessions)
            .where((Sessions.session_type == "Sprint") & (Sessions.round_number <= max_round))
        ).all()
        results = self.session.exec(
            select(
                SessionResult.driver_id,
                func.sum(SessionResult.points).label("total_points")
            )
            .where(SessionResult.round_number <= max_round)
            .group_by(SessionResult.driver_id)
        ).all()
        all_results = self.session.exec(
            select(SessionResult)
            .where(
                (SessionResult.round_number <= max_round) &
                ((SessionResult.session_number == 5) | (SessionResult.session_number == 3))
            )
        ).all()
        drivers = self.session.exec(select(Drivers)).all()
        return {
            "max_round": max_round,
            "sprint_rounds": sprint_rounds, 
            "results": results, 
            "all_results": all_results,
            "drivers": drivers
        }
