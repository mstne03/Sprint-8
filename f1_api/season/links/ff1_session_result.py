import logging
import math
import fastf1 as ff1
from fastf1 import plotting
from f1_api.models.f1_models import SessionResult

def get_session_results(year:int, driver_id_map, team_id_map):
    session_results = []
    schedule = ff1.get_event_schedule(year)

    for _, event in schedule.iloc[1:].iterrows():
        if event["EventFormat"] == "testing":
            continue
        round_number = event["RoundNumber"]
        event_name = event["EventName"]

        sessions = [
            event["Session1"],
            event["Session2"],
            event["Session3"],
            event["Session4"],
            event["Session5"]
        ]

        for session_number, session_type in enumerate(sessions, start=1):
            try:
                session = ff1.get_session(year=year, gp=event_name, identifier=session_type)
                try:
                    session.load(laps=True, telemetry=False, weather=False, messages=False)
                except Exception as e:
                    logging.warning(f"Skipping session {session_type} for event {event_name} in year {year}: {e}")
                    return session_results

                driver_list = session.drivers
                results = session.results
                laps = session.laps

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
                        session_fastest = laps.pick_fastest()["LapTime"].total_seconds()
                        fastest_lap = fastest == session_fastest

                    if session_type == "Qualifying":
                        position = int(driver_results["Position"])

                    session_results.append(SessionResult(
                        season_id=year,
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
                logging.warning(f"Skipping session {session_type} for event {event_name} in year {year}: {e}")
                continue
    return session_results
