"""This layer connects the API to the external FastF1 service"""
from typing import Optional
import logging
import fastf1 as ff1
from fastf1.events import EventSchedule
from f1_api.models.f1_schemas import Events

class SessionLoadError(Exception):
    """
    Custom exception for fastf1 session loading errors
    """

class FastF1Client:
    """Base client for FastF1 API communication"""

    @staticmethod
    def get_event_schedule(year: int) -> Optional[EventSchedule]:
        """Get event schedule for a year"""
        try:
            return ff1.get_event_schedule(year)
        except Exception as e:
            logging.error(f"Error getting schedule for {year}: {e}")
            return None

    @staticmethod
    def get_session_map(year: int, existing_rounds: list[int]) -> dict:
        """Get session map data"""
        session_map = {}

        try:
            schedule = FastF1Client.get_event_schedule(year)
            
            for _,event in schedule.iloc[1:].iterrows():
                rn = event["RoundNumber"]
                if rn in existing_rounds:
                    logging.info(f"{event["EventName"]} already in DB")
                    continue
                if event["EventFormat"] == "testing":
                    continue
                name = event["EventName"]
                sessions = [
                    event["Session1"],
                    event["Session2"],
                    event["Session3"],
                    event["Session4"],
                    event["Session5"]
                ]
                for session_type in sessions:
                    try:
                        f1_session = ff1.get_session(year=year,gp=name,identifier=session_type)
                        f1_session.load(laps=True, telemetry=False, weather=False, messages=False)
                        
                        if f1_session.results.empty:
                            logging.warning(f"No data for session {session_type} at {name}, skipping.")
                            raise Exception("No more sessions to load")
                        
                        session_map[(rn, session_type)] = f1_session
                    except Exception as e:
                        logging.warning(f"Failed to load session {session_type} at {name}")
                        raise SessionLoadError from e
            return session_map
        except SessionLoadError:
            logging.warning("Stopped loading further sessions")
            return session_map

def load_sessions(year,existing):
    return FastF1Client.get_session_map(year=year,existing_rounds=existing)