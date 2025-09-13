import logging
from ...models.f1_models import Drivers
import fastf1 as ff1
from fastf1 import plotting

def get_driver_data(schedule, year:int):
    try:
        drivers_list = []
        added_driver_names = set()

        for _, event in schedule.iloc[1:].iterrows():
            if event["EventFormat"] == "testing":
                    continue
            event_name = event["EventName"]

            sessions = [
                event["Session1"],
                event["Session2"],
                event["Session3"],
                event["Session4"],
                event["Session5"]
            ]

            for session_type in sessions:     
                session = ff1.get_session(year=year,gp=event_name,identifier=session_type)
                session.load(laps=False, telemetry=False, weather=False, messages=False)
                results = session.results

                driver_names = plotting.list_driver_names(session)

                for driver in driver_names:
                    if driver in added_driver_names:
                        continue

                    added_driver_names.add(driver)

                    driver_id = results.loc[results["FullName"] == driver, "DriverNumber"].values[0] if not results.loc[results["FullName"] == driver, "DriverNumber"].empty else None
                    acronym = results.loc[results["FullName"] == driver, "Abbreviation"].values[0] if not results.loc[results["FullName"] == driver, "Abbreviation"].empty else None
                    country = results.loc[results["FullName"] == driver, "CountryCode"].values[0] if not results.loc[results["FullName"] == driver, "CountryCode"].empty else None

                    drivers_list.append(Drivers(
                        id = int(driver_id),
                        full_name = str(driver),
                        acronym = str(acronym),
                        country_code = str(country)
                    ))
        return drivers_list
    except Exception as e:
        logging.warning(f'During get_driver_data for year {year}, exception: {e}')
        return []
