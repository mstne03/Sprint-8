import logging
from sqlmodel import select
from f1_api.models.f1_models import Events

def get_event_data(year:int, schedule, session):
    events = []
    try:
        round_numbers = set(session.exec(select(Events.round_number)).all())
        for _, event in schedule.iloc[1:].iterrows():
            name = event["EventName"]
            rn = event["RoundNumber"]
            if rn in round_numbers:
                continue
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
