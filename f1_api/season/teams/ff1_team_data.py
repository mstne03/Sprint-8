import logging
from sqlmodel import select
from fastf1 import plotting
from f1_api.models.f1_models import Teams

def get_team_data(schedule,session_map,session):
    
    teams = []
    added_team_names = set()
    existing_teams = set(session.exec(select(Teams.team_name)).all())

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
                f1_session = session_map.get((round_number,session_type))
                
                # Skip if session data not available
                if f1_session is None:
                    continue
                
                try:
                    team_names = plotting.list_team_names(f1_session)
                except (ConnectionError, ValueError) as e:
                    logging.warning('Failed to get team names for round %d, session %s: %s', round_number, session_type, e)
                    continue

                for name in team_names:
                    if name in existing_teams:
                        continue
                    if name in added_team_names:
                        continue
                    
                    added_team_names.add(name)

                    try:
                        team_color = plotting.get_team_color(name, f1_session)
                    except (ConnectionError, ValueError) as e:
                        logging.warning('Failed to get color for team %s: %s', name, e)
                        team_color = "#FFFFFF"  # Default color
                    
                    teams.append(Teams(
                        team_name=name,
                        team_color=team_color
                    ))
            except (ConnectionError, ValueError) as e:
                logging.warning('Error processing session %s for round %d: %s', session_type, round_number, e)
                continue  # Continue with next session instead of returning
    return teams
    
