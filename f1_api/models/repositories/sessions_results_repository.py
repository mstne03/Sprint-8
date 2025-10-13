"""Gets Teams data from the DB"""
import logging
import math
from sqlmodel import Session, select
from fastf1 import plotting
from f1_api.models.f1_schemas import Events, SessionResult

class SessionResultsRepository:
    def __init__(self, year: int, session:Session, schedule):
        self.season = year
        self.session = session
        self.schedule = schedule
    
    def get_registered_rounds(self):
        return set(self.session.exec(select(SessionResult.round_number)).all())
    
    def get_registered_results(self):
        existing_results_query = self.session.exec(
            select(SessionResult.round_number, SessionResult.session_number, SessionResult.driver_id)
        ).all()
        return set((result.round_number, result.session_number, result.driver_id) for result in existing_results_query)

    def get_session_results(self, session_map, driver_id_map, team_id_map):
        session_results = []
        existing_results = self.get_registered_results()

        for _,event in self.schedule.iloc[1:].iterrows():
            event_name = event["EventName"]
            round_number = event["RoundNumber"]

            sessions = [
                event["Session1"],
                event["Session2"],
                event["Session3"],
                event["Session4"],
                event["Session5"]
            ]

            for session_number, session_type in enumerate(sessions, start=1):
                try:
                    f1_session = session_map.get((round_number, session_type))
                    
                    # Skip if session data not available
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
                            team_name = plotting.get_team_name_by_driver(identifier=driver_name,session=f1_session)
                        except Exception as e:
                            logging.warning(f"Skipping driver {driver_name} with id {driver_id_map.get(int(driver_num))}: {e}")
                            continue

                        team_id = team_id_map.get(team_name)
                        driver_id = driver_id_map.get(int(driver_num))

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

                        rn = self.session.exec(select(Events.round_number).where(Events.event_name == event_name)).first()

                        if (rn, session_number, driver_id) in existing_results:
                            continue

                        session_results.append(SessionResult(
                            season_id=self.season,
                            round_number=rn,
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
                    logging.warning(f"Skipping session {session_type} for event {event["EventName"]} in year {self.season}: {e}")
                    return session_results
        return session_results

def get_all_registered_rounds(year, session, schedule):
    registered_results = SessionResultsRepository(year, session, schedule)
    return registered_results.get_registered_rounds()

def get_session_results(year, session, schedule, session_map, driver_id_map, team_id_map):
    session_results = SessionResultsRepository(year, session, schedule)
    return session_results.get_session_results(session_map, driver_id_map, team_id_map)