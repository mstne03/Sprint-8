from sqlalchemy import func
from sqlmodel import Session, select
from f1_api.models.f1_schemas import Drivers, SessionResult, Sessions

class DriversRepository:
    """Repository for drivers data ingestion from FastF1"""
    def __init__(self, session: Session, year: int):
        self.session = session
        self.season = year
    def get_all_drivers(self) -> list[Drivers]:
        return list(self.session.exec(select(Drivers)))
    def get_drivers_id_map(self):
        all_drivers = list(self.session.exec(select(Drivers)))
        driver_id_map = {driver.driver_number: driver.id for driver in all_drivers}
        return driver_id_map
    def check_existing_drivers(self, driver: dict) -> Drivers | None:
        existing = self.session.exec(
            select(Drivers).where(Drivers.driver_number == driver["driver_number"])
        ).first()
        if existing:
            needs_update = (
                existing.driver_color != driver["driver_color"] or
                existing.headshot_url != driver["headshot_url"]
            )
            if needs_update:
                existing.driver_color = driver["driver_color"]
                existing.headshot_url = driver["headshot_url"]
                return existing
            return None
        return Drivers(**driver)
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
def get_drivers_id_map(session,year):
    drivers_repo = DriversRepository(session,year)
    return drivers_repo.get_drivers_id_map()
