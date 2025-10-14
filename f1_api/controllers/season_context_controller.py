"""Season Context Controller - Encapsulates season data loading logic"""
from datetime import datetime
from sqlmodel import Session
from f1_api.data_sources.ff1_client import FastF1Client
from f1_api.models.repositories.sessions_results_repository import get_all_registered_rounds


class SeasonContextController:
    """Controller to manage season context (schedule, session_map, registered rounds)"""
    def __init__(self, session: Session, ff1_client = FastF1Client):
        self.session = session
        self.ff1_client = ff1_client
        self.year = datetime.now().year
        self._schedule = None
        self._registered_rounds = None
        self._session_map = None
        self._session_types_by_rn = None
    
    @property
    def schedule(self):
        """Lazy load schedule"""
        if self._schedule is None:
            self._schedule = self.ff1_client.get_event_schedule(self.year)
        return self._schedule
    
    @property
    def registered_rounds(self):
        """Lazy load registered rounds"""
        if self._registered_rounds is None:
            self._registered_rounds = get_all_registered_rounds(self.year, self.session, self.schedule)
        return self._registered_rounds
    
    @property
    def session_map(self):
        """Lazy load session map"""
        if self._session_map is None:
            self._session_map = self.ff1_client.get_session_map(self.year, self.registered_rounds)
        return self._session_map
    
    @property
    def session_types_by_rn(self):
        """Lazy load session types by round number"""
        if self._session_types_by_rn is None:
            self._session_types_by_rn = {}
            for _,event in self.schedule.iloc[1:].iterrows():
                round_number = event["RoundNumber"]
                sessions = [
                    event["Session1"],
                    event["Session2"],
                    event["Session3"],
                    event["Session4"],
                    event["Session5"]
                ]
                self._session_types_by_rn[round_number] = sessions
        return self._session_types_by_rn
    
    def get_context(self):
        """Get all context data as a tuple"""
        return self.schedule, self.registered_rounds, self.session_map, self.session_types_by_rn

def get_season_context_service(session: Session) -> SeasonContextController:
    """Factory function for creating SeasonContextController"""
    return SeasonContextController(session)
