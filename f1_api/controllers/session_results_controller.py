import logging
import math
from sqlmodel import Session
from f1_api.controllers.season_context_controller import SeasonContextController
from f1_api.data_sources.ff1_client import FastF1Client
from f1_api.models.f1_schemas import SessionResult
from f1_api.models.repositories.drivers_repository import DriversRepository
from f1_api.models.repositories.sessions_results_repository import SessionResultsRepository
from f1_api.models.repositories.teams_repository import TeamsRepository

class SessionResultsController:
    def __init__(self, session: Session, year: int):
        self.session = session
        self.season = year
        self.repository = SessionResultsRepository(year,session)
        self.season_context = SeasonContextController(session, FastF1Client)
        self.drivers_repository = DriversRepository(session,year)
        self.teams_repository = TeamsRepository(session)
    def get_session_results(self):
        session_results = []
        existing_results = self.repository.get_registered_results()
        session_map = self.season_context.session_map
        session_types_by_rn = self.season_context.session_types_by_rn
        for round_number, session_types in session_types_by_rn.items():
            for session_number,session_type in enumerate(session_types, start=1):
                try:
                    f1_session = session_map.get((round_number, session_type))
                    
                    if f1_session is None:
                        continue

                    driver_list = f1_session.drivers
                    results = f1_session.results
                    laps = f1_session.laps
                    
                    if session_type in ("Sprint", "Race"):
                        fastest_driver = laps.pick_fastest()["Driver"]

                        disq_drivers = results.loc[results["Status"] == "Disqualified", "Abbreviation"]

                        if fastest_driver in disq_drivers.values:
                            laps = laps[laps["Driver"] != fastest_driver]

                    for driver_num in driver_list:
                        driver_name = results.loc[results["DriverNumber"] == driver_num, "Abbreviation"].values[0]

                        try:
                            team_name = self.season_context.get_session_team_name_by_driver(driver_name,f1_session)
                        except Exception as e:
                            logging.warning(f"Skipping driver {driver_name}: {e}")
                            continue

                        team_id = self.teams_repository.get_team_id_map().get(team_name)
                        driver_id = self.drivers_repository.get_drivers_id_map().get(int(driver_num))

                        if driver_id is None or team_id is None:
                            continue

                        driver_results = f1_session.get_driver(driver_name)
                        position = None
                        grid_position = None
                        fastest = None
                        driver_lap = laps.pick_drivers(driver_name).pick_fastest()
                        if driver_lap is not None:
                            fastest = driver_lap["LapTime"].total_seconds()
                        total_time = None
                        status = None
                        points = None
                        fastest_lap = None

                        if session_type in ("Sprint", "Race"):
                            position = driver_results["ClassifiedPosition"]
                            grid_position = int(driver_results["GridPosition"])
                            total_time = driver_results["Time"].total_seconds()

                            if math.isnan(total_time):
                                total_time = None

                            points = int(driver_results["Points"])
                            status = driver_results["Status"]
                            session_fastest = laps["LapTime"].min().total_seconds()
                            classified = str(driver_results["ClassifiedPosition"])
                            if classified.isdigit():
                                fastest_lap = fastest == session_fastest
                            else:
                                fastest_lap = False

                        if session_type == "Qualifying":
                            position = int(driver_results["Position"])

                        if (round_number, session_number, driver_id) in existing_results:
                            continue

                        session_results.append(SessionResult(
                            season_id=self.season,
                            round_number=round_number,
                            session_number=session_number,
                            driver_id=driver_id,
                            team_id=team_id,
                            position=position,
                            grid_position=grid_position,
                            best_lap_time=fastest,
                            total_time=total_time,
                            points=points,
                            status=status,
                            fastest_lap=fastest_lap
                        ))
                except Exception as e:
                    logging.warning(f"Skipping session {session_type} for round {round_number} in year {self.season}: {e}")
                    return session_results
        return session_results
def get_session_results(year, session):
    session_results = SessionResultsController(session,year)
    return session_results.get_session_results()
