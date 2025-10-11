from sqlmodel import Session, select
from f1_api.models.f1_schemas import Events


class EventsRepository:
    def __init__(self, session: Session, year: int, schedule):
        self.session = session
        self.season = year
        self.schedule = schedule
    
    def get_events_data(self) -> list[Events]:
        events = []
        round_numbers = set(self.session.exec(
            select(Events.round_number)
        ).all())
        for _,event in self.schedule.iloc[1:].iterrows():
            name = event["EventName"]
            rn = event["RoundNumber"]
            if rn in round_numbers:
                continue
            events.append(Events(
                round_number = int(rn),
                season_id = self.season,
                event_name = name,
                event_type = str(event["EventFormat"]),
                event_country = str(event["Country"]),
                date_start = event["EventDate"].to_pydatetime()
            ))
        return events

def get_event_data(session, year, schedule):
    events_repo = EventsRepository(session, year, schedule)
    return events_repo.get_events_data()