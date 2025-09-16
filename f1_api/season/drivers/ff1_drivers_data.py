import logging
from f1_api.models.f1_models import Drivers
import fastf1 as ff1
from fastf1 import plotting

def get_driver_data(schedule,session_map):
    drivers_list = []
    added_driver_names = set()

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
                session = session_map.get((round_number,session_type))
                
                results = session.results

                driver_names = plotting.list_driver_names(session)

                for driver in driver_names:
                    if driver in added_driver_names:
                        continue

                    added_driver_names.add(driver)

                    driver_number = results.loc[results["FullName"] == driver, "DriverNumber"].values[0] if not results.loc[results["FullName"] == driver, "DriverNumber"].empty else None
                    acronym = results.loc[results["FullName"] == driver, "Abbreviation"].values[0] if not results.loc[results["FullName"] == driver, "Abbreviation"].empty else None
                    country = results.loc[results["FullName"] == driver, "CountryCode"].values[0] if not results.loc[results["FullName"] == driver, "CountryCode"].empty else None

                    drivers_list.append(Drivers(
                        driver_number = int(driver_number),
                        full_name = driver,
                        acronym = acronym,
                        country_code = country
                    ))
            except Exception as e:
                logging.warning(f"Round {event["RoundNumber"]} not availavle yet: {e}")
                return drivers_list
    return drivers_list
