import logging
from sqlalchemy import select
from fastf1 import plotting
from f1_api.models.f1_schemas import DriverTeamLink

def get_all_driver_team_links(year, schedule, session_map, driver_id_map, team_id_map, session):
    """
    Returns a list of DriverTeamLink objects for all (driver, team, round) assignments in the given year.
    driver_id_map: dict mapping driver full name to driver_id
    team_id_map: dict mapping team name to team_id
    """
    links = set()
    driver_team_links = []
    existing_links = set(session.exec(select(DriverTeamLink.driver_id, DriverTeamLink.team_id)).all())
    for _, event in schedule.iloc[1:].iterrows():
        round_number = event["RoundNumber"]

        sessions = [
            event["Session1"],
            event["Session2"],
            event["Session3"],
            event["Session4"],
            event["Session5"]
        ]

        for session_type in sessions:
            try:
                f1_session = session_map.get((round_number, session_type))
                
                # Skip if session data not available
                if f1_session is None:
                    continue
                
                driver_list = f1_session.drivers
                results = f1_session.results

                for driver_num in driver_list:
                    try:
                        driver_id = driver_id_map.get(int(driver_num))
                        driver_abb = results.loc[results["DriverNumber"] == driver_num, "Abbreviation"].values[0]
                        team_name = plotting.get_team_name_by_driver(identifier=driver_abb,session=f1_session)
                        team_id = team_id_map.get(team_name)
                        if (driver_id, team_id) in existing_links:
                            continue
                        if driver_id is None or team_id is None:
                            continue
                        link_key = (driver_id, team_id, year, round_number)
                        if link_key in links:
                            continue
                        driver_team_links.append(DriverTeamLink(
                            driver_id=driver_id,
                            team_id=team_id,
                            season_id=year,
                            round_number=round_number
                        ))
                        links.add(link_key)
                    except Exception as e:
                        logging.warning(f"Skipping driver {driver_num} in session {session_type}: {e}")
                        continue
            except Exception as e:
                logging.warning(f"Round {event["RoundNumber"]} not availavle yet: {e}")
                return driver_team_links
    return driver_team_links
