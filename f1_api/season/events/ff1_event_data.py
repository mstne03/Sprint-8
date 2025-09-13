import logging
from ...models.f1_models import Events
import fastf1 as ff1

def get_event_data(schedule, year:int):
    events = []
    try:
        for _, e in schedule.iloc[1:].iterrows():
            name = e["EventName"]
            event = ff1.get_event(year=year, gp=name)
            rn = event["RoundNumber"]
            events.append(Events(
                round_number = int(rn),
                season_id = year,
                event_name = name,
                event_type = str(event["EventFormat"]),
                event_country = str(event["Country"]),
                date_start = event["EventDate"].to_pydatetime()
            ))
        if not events:
            raise Exception(f'Check get_event_data event variable to resolve the exception')
        return events
    except Exception as e:
        logging.warning(f'During the execution of get_event_data function, the following exception occured: {e}')
        return []
