import logging
from sqlmodel import select
from f1_api.models.f1_models import Drivers, DriverTeamLink
from fastf1 import plotting
from ..utils.create_driver_id import create_driver_id
from ..utils.driver_headshot_url import get_driver_headshot_url

def get_driver_data(schedule,session_map,session,year):
    """
    This function gathers all of the relevant data for the current season's grid drivers
    """
    drivers_list = []
    added_drivers = set()
    existing_drivers = set(session.exec(select(Drivers.full_name, Drivers.driver_color, Drivers.headshot_url)).all())

    for _, event in schedule.iloc[1:].iterrows():
        round_number = event["RoundNumber"]

        sessions = [
            event["Session1"],
            event["Session2"],
            event["Session3"],
            event["Session4"],
            event["Session5"]
        ]

        race = session_map.get((round_number,sessions[4]))
        teams = plotting.list_team_names(session=race)
        accept_drivers = set()

        for t in teams:
            accept_drivers.update(plotting.get_driver_names_by_team(identifier=t,session=race))

        for session_type in sessions:
            try:
                session = session_map.get((round_number,session_type))
                
                results = session.results

                driver_names = plotting.list_driver_names(session)

                for driver in driver_names:
                    if driver not in accept_drivers:
                        continue

                    driver_color = plotting.get_driver_color(driver,session)

                    driver_number = results.loc[results["FullName"] == driver, "DriverNumber"].values[0] if not results.loc[results["FullName"] == driver, "DriverNumber"].empty else None

                    acronym = results.loc[results["FullName"] == driver, "Abbreviation"].values[0] if not results.loc[results["FullName"] == driver, "Abbreviation"].empty else None
                    country = results.loc[results["FullName"] == driver, "CountryCode"].values[0] if not results.loc[results["FullName"] == driver, "CountryCode"].empty else None
                    team = results.loc[results["FullName"] == driver, "TeamName"].values[0] if not results.loc[results["FullName"] == driver, "TeamName"].empty else None
                    team_name = team.lower().replace(" ", "")
                    driver_id = create_driver_id(driver)
                    headshot_url = get_driver_headshot_url(year,team_name,driver_id)

                    if (driver_number, team) in added_drivers:
                        continue

                    added_drivers.add((driver_number, team))

                    if (driver, driver_color, headshot_url) in existing_drivers:
                        continue

                    drivers_list.append(Drivers(
                        driver_number = int(driver_number),
                        full_name = driver,
                        acronym = acronym,
                        driver_color=driver_color,
                        country_code = country,
                        headshot_url=headshot_url
                    ))
            except Exception as e:
                logging.warning(f"Round {event["RoundNumber"]} not availavle yet: {e}")
                return drivers_list
    return drivers_list
