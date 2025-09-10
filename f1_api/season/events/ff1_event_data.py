import logging
import fastf1 as ff1

def get_event_data(event, year:int):
    try:
        events = []

        for _, e in event.iterrows():
            name = e["EventName"]

            meeting = ff1.get_event(year, name)

            events.append({
                "year": year,
                "event_name": name,
                "event_format": meeting["EventFormat"],
                "country": meeting["Country"],
                "sessions": [],
                "date_start": meeting["EventDate"]
            })
    except Exception as e:
        logging.warning(f'During the execution of get_event_data function, the following exception occured: {e}')


    return events