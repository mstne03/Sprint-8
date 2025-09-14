import logging
import fastf1 as ff1
from fastf1 import plotting
from f1_api.models.f1_models import Teams

def get_team_data(year:int,schedule):
    
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
            try:
                session = ff1.get_session(year=year,gp=event_name,identifier=session_type)
                session.load(laps=False, telemetry=False, weather=False, messages=False)
                
                team_names = plotting.list_team_names(session)

                for name in team_names:
                    if name in added_team_names:
                        continue
                    
                    added_team_names.add(name)

                    teams.append(Teams(
                        team_name=name
                    ))
            except Exception as e:
                logging.warning(f'During get_team_data for year {year}, exception: {e}')
                return teams
    return teams
    
