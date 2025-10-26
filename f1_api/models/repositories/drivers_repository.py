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
    
    def get_drivers_by_ids(self, driver_ids: list[int]) -> list[Drivers]:
        """Get drivers by list of IDs"""
        if not driver_ids:
            return []
        # Build OR conditions for each ID
        drivers = []
        for driver_id in driver_ids:
            driver = self.session.exec(
                select(Drivers).where(Drivers.id == driver_id)
            ).first()
            if driver:
                drivers.append(driver)
        return drivers
    
    def get_drivers_id_map(self):
        all_drivers = list(self.session.exec(select(Drivers)))
        driver_id_map = {driver.driver_number: driver.id for driver in all_drivers}
        return driver_id_map
    def check_existing_drivers(self, driver: dict) -> Drivers | None:
        existing = self.session.exec(
            select(Drivers).where(Drivers.driver_number == driver["driver_number"])
        ).first()
        if existing:
            # Extract team name from existing and new headshot URLs
            # URL format: /common/f1/{year}/{team_name}/{driver_id}/{year}{team_name}{driver_id}right.webp
            existing_team = self._extract_team_from_url(existing.headshot_url)
            new_team = self._extract_team_from_url(driver["headshot_url"])
            
            needs_update = (
                existing.driver_color != driver["driver_color"] or
                existing_team != new_team  # Only update if team changed
            )
            if needs_update:
                existing.driver_color = driver["driver_color"]
                # Only update headshot_url if team changed
                if existing_team != new_team:
                    existing.headshot_url = driver["headshot_url"]
                return existing
            return None
        # Set current market value to 10M for new drivers (base_price removed - not used)
        driver["current_market_value"] = 10_000_000
        return Drivers(**driver)
    
    def _extract_team_from_url(self, url: str) -> str:
        """
        Extract team name from headshot URL.
        URL format: /common/f1/{year}/{team_name}/{driver_id}/{year}{team_name}{driver_id}right.webp
        Example: /common/f1/2025/mercedes/andant01/2025mercedesandant01right.webp -> mercedes
        """
        try:
            parts = url.split('/')
            # The team name is at index 4 in the URL path
            if len(parts) >= 5:
                return parts[4]
            return ""
        except Exception:
            return ""
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
