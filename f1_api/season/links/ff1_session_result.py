import logging
import math
from sqlmodel import select
from fastf1 import plotting
from f1_api.models.f1_models import SessionResult, Events

def get_session_results(year:int, schedule, session_map, driver_id_map, team_id_map, sql_session):
    session_results = []
    existing_results = existing_results = set(sql_session.exec(select(SessionResult.round_number, SessionResult.session_number, SessionResult.driver_id)).all())

    for _, event in schedule.iloc[1:].iterrows():
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
                session = session_map.get((round_number, session_type))

                driver_list = session.drivers
                results = session.results
                laps = session.laps
                
                if session_type in ("Sprint", "Race"):
                    fastest_driver = laps.pick_fastest()["Driver"]

                    disq_drivers = results.loc[results["Status"] == "Disqualified", "Abbreviation"]

                    if fastest_driver in disq_drivers.values:
                        laps = laps[laps["Driver"] != fastest_driver]

                for driver_num in driver_list:
                    driver_name = results.loc[results["DriverNumber"] == driver_num, "Abbreviation"].values[0]

                    try:
                        team_name = plotting.get_team_name_by_driver(identifier=driver_name,session=session)
                    except Exception as e:
                        logging.warning(f"Skipping driver {driver_name} with id {driver_id_map.get(int(driver_num))}: {e}")
                        continue

                    team_id = team_id_map.get(team_name)
                    driver_id = driver_id_map.get(int(driver_num))

                    if driver_id is None or team_id is None:
                        continue

                    driver_results = session.get_driver(driver_name)
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

                    rn = sql_session.exec(select(Events.round_number).where(Events.event_name == event_name)).first()

                    if (rn, session_number, driver_id) in existing_results:
                        continue

                    session_results.append(SessionResult(
                        season_id=year,
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
                logging.warning(f"Skipping session {session_type} for event {event["EventName"]} in year {year}: {e}")
                return session_results
    return session_results
