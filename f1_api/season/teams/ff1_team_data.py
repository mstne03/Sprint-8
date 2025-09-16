import logging
import fastf1 as ff1
from fastf1 import plotting
from f1_api.models.f1_models import Teams

def get_team_data(schedule,session_map):
    
    teams = []
    added_team_names = set()

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
                
                team_names = plotting.list_team_names(session)

                for name in team_names:
                    if name in added_team_names:
                        continue
                    
                    added_team_names.add(name)

                    teams.append(Teams(
                        team_name=name
                    ))
            except Exception as e:
                logging.warning(f'During get_team_data, exception: {e}')
                return teams
    return teams
    
