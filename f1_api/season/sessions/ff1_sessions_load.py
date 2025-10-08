
import logging
import fastf1 as ff1

class SessionLoadError(Exception):
    """
    Custom exception for fastf1 session loading errors
    """

def load_sessions(year,schedule,existing_rounds):
    """
    Loads all sessions for current season and returns them in a map object
    """
    session_map = {}

    try:
        for _,event in schedule.iloc[1:].iterrows():
            rn = event["RoundNumber"]
            if rn in existing_rounds:
                logging.info("%s already in DB", event["EventName"])
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
                        logging.warning("No data for session %s at %s, skipping.", session_type, name)
                        raise ValueError("No more sessions to load")
                    
                    session_map[(rn, session_type)] = f1_session
                except Exception as e:
                    logging.warning("Failed to load session %s at %s", session_type, name)
                    raise SessionLoadError from e
        return session_map
    except SessionLoadError:
        logging.warning("Stopped loading further sessions")
        return session_map