"""Season Context Service - Encapsulates season data loading logic"""
from datetime import datetime
from sqlmodel import Session
from f1_api.data_sources.ff1_client import FastF1Client
from f1_api.models.repositories.sessions_results_repository import get_all_registered_rounds


class SeasonContextService:
    """Service to manage season context (schedule, session_map, registered rounds)"""
    
    def __init__(self, session: Session, year: int = None):
        self.session = session
        self.year = year or datetime.now().year
        self._schedule = None
        self._registered_rounds = None
        self._session_map = None
    
    @property
    def schedule(self):
        """Lazy load schedule"""
        if self._schedule is None:
            self._schedule = FastF1Client.get_event_schedule(self.year)
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
            self._session_map = FastF1Client.get_session_map(self.year, self.registered_rounds)
        return self._session_map
    
    def get_context(self):
        """Get all context data as a tuple"""
        return self.schedule, self.registered_rounds, self.session_map


def get_season_context_service(session: Session, year: int = None) -> SeasonContextService:
    """Factory function for creating SeasonContextService"""
    return SeasonContextService(session, year)