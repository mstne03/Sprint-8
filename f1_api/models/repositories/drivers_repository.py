import logging
from sqlalchemy import func
from sqlmodel import Session, select
from fastf1 import plotting
from f1_api.models.f1_schemas import Drivers, SessionResult, Sessions
from f1_api.models.business.drivers_business import DriversBusiness


class DriversQueryRepository:
    """Repository for drivers queries that only need database session"""
    def __init__(self, session: Session):
        self.session = session
    
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


class DriversRepository:
    """Repository for drivers data ingestion from FastF1"""
    def __init__(self, session: Session, year: int, session_map, schedule):
        self.session = session
        self.season = year
        self.session_map = session_map
        self.schedule = schedule
        self.query_repo = DriversQueryRepository(session)
    
    
    def get_driver_data(self) -> list[Drivers]:
        drivers_list = []
        added_drivers = set()

        for _,event in self.schedule.iloc[1:].iterrows():
            round_number = event["RoundNumber"]

            sessions = [
                event["Session1"],
                event["Session2"],
                event["Session3"],
                event["Session4"],
                event["Session5"]
            ]

            race = self.session_map.get((round_number,sessions[4]))
            accept_drivers = set()
            
            # Only proceed if we have race data
            if race is not None:
                teams = plotting.list_team_names(session=race)
                for t in teams:
                    accept_drivers.update(plotting.get_driver_names_by_team(identifier=t,session=race))
            else:
                logging.warning(f"No race data available for round {round_number}, skipping driver processing for this round")
                continue

            for session_type in sessions:
                try:
                    f1_session = self.session_map.get((round_number,session_type))
                    
                    # Skip if session data not available
                    if f1_session is None:
                        continue
                    
                    results = f1_session.results

                    driver_names = plotting.list_driver_names(f1_session)

                    for driver in driver_names:
                        if driver not in accept_drivers:
                            continue

                        driver_color = plotting.get_driver_color(driver,f1_session)

                        driver_number = results.loc[results["FullName"] == driver, "DriverNumber"].values[0] if not results.loc[results["FullName"] == driver, "DriverNumber"].empty else None

                        acronym = results.loc[results["FullName"] == driver, "Abbreviation"].values[0] if not results.loc[results["FullName"] == driver, "Abbreviation"].empty else None
                        country = results.loc[results["FullName"] == driver, "CountryCode"].values[0] if not results.loc[results["FullName"] == driver, "CountryCode"].empty else None
                        team = results.loc[results["FullName"] == driver, "TeamName"].values[0] if not results.loc[results["FullName"] == driver, "TeamName"].empty else None
                        team_name = team.lower().replace(" ", "")
                        driver_id = DriversBusiness.create_driver_id(driver)
                        headshot_url = DriversBusiness.get_driver_headshot_url(self.season,team_name,driver_id)

                        driver_key = (driver_number, team)
                        if driver_key in added_drivers:
                            continue
                        
                        added_drivers.add(driver_key)
                        
                        driver_obj = {
                            "driver_number": int(driver_number),
                            "full_name": driver,
                            "acronym": acronym,
                            "driver_color": driver_color,
                            "country_code": country,
                            "headshot_url": headshot_url
                        }

                        updated_driver = self.query_repo.check_existing_drivers(driver_obj)

                        if updated_driver:
                            drivers_list.append(updated_driver)
                except Exception as e:
                    logging.warning(f"Round {event["RoundNumber"]} not availavle yet: {e}")
                    return drivers_list
        return drivers_list

def get_driver_data(session,year,session_map,schedule):
    drivers_repo = DriversRepository(session,year,session_map,schedule)
    return drivers_repo.get_driver_data()

def get_drivers_id_map(session):
    query_repo = DriversQueryRepository(session)
    return query_repo.get_drivers_id_map()

def get_driver_results(session):
    query_repo = DriversQueryRepository(session)
    return query_repo.get_driver_results()