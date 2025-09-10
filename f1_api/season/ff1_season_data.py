import logging
import fastf1 as ff1
from .teams.ff1_team_data import get_team_data
from .events.ff1_event_data import get_event_data

def get_season_data(year:int):

    try:
        schedule = ff1.get_event_schedule(year)

        events = get_event_data(schedule, year)

        if (not events):
            raise Exception(f'Check get_season_data event variable')

        teams = get_team_data(schedule, year)
    except Exception as e:
        logging.warning(f'During the execution of get_season_data function, the following exception ocurred: {e}')
        return

    return {
        "events": events,
        "teams": teams,
        "year": year
    }
