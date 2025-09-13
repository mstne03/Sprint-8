import logging
import fastf1 as ff1
from fastf1 import plotting
from ...models.f1_models import Teams

def get_team_data(schedule, year:int):
    try:
        teams = []
        added_team_names = set()

        for _, event in schedule.iloc[1:].iterrows():
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
                
                team_names = plotting.list_team_names(session)

                for name in team_names:
                    if name in added_team_names:
                        continue
                    
                    added_team_names.add(name)

                    drivers_id = results.loc[results["TeamName"] == name, "DriverNumber"].tolist()

                    teams.append(Teams(
                        driver1_id = int(drivers_id[0]),
                        driver2_id = int(drivers_id[1]),
                        team_name = str(name)
                    ))
        return teams
    except Exception as e:
        logging.warning(f'During get_team_data for year {year}, exception: {e}')
        return []
