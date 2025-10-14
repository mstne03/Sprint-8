from sqlmodel import Session
from f1_api.controllers.season_context_controller import SeasonContextController
from f1_api.models.f1_schemas import Events
from f1_api.models.repositories.events_repository import EventsRepository

class EventsController:
    def __init__(self, session: Session, year: int):
        self.repository = EventsRepository(session, year)
        self.season_context = SeasonContextController(session)

    def get_events_data(self):
        events = []
        round_numbers = self.repository.get_round_numbers()
        events_data = self.season_context.events_data
        for e in events_data:
            if e["round_number"] in round_numbers:
                continue
            events.append(Events(
                round_number=e["round_number"],
                season_id=e["season_id"],
                event_name=e["event_name"],
                event_type=e["event_type"],
                event_country=e["event_country"],
                date_start=e["date_start"]
            ))
        return events

def get_event_data(session, year):
    events_controller = EventsController(session,year)
    return events_controller.get_events_data()