import logging
import fastf1 as ff1
from .ff1_team_standings_results import get_standings_data
from .ff1_team_race_results import get_race_results

def get_team_data(schedule, year):
    try:
        teams = []

        event = schedule.iloc[1]["EventName"]

        session = ff1.get_session(year,event,'R')

        team_names = ff1.plotting.list_team_names(session)

        for name in team_names:

            standings = get_standings_data(schedule,year,name)
            
            race_results = get_race_results(schedule,year,name)

            teams.append({
                "year": year,
                "team_name": name,
                "drivers": ff1.plotting.get_driver_names_by_team(name, session),
                "raceResults": race_results,
                "standings": standings
            })
    except Exception as e:
        logging.warning(f'During the execution of get_team_data function, the following exception ocurred: {e}')
        return

    return teams