import logging
from sqlmodel import select
from f1_api.models.f1_models import Sessions

def get_session_data(year, schedule, session):
    """
    Creates session models returning them in an array
    """
    try:
        sessions = []
        existing_sessions = set(session.exec(select(Sessions.round_number, Sessions.session_number)).all())
        for _,event in schedule.iloc[1:].iterrows():
            session_names = [
                event["Session1"],
                event["Session2"],
                event["Session3"],
                event["Session4"],
                event["Session5"]
            ]

            for i, s in enumerate(session_names):
                rn = int(event["RoundNumber"])
                if (rn, i+1) in existing_sessions:
                    continue
                if not rn:
                    continue

                sessions.append(Sessions(
                    round_number = rn,
                    season_id = year,
                    session_number = i+1,
                    session_type = str(s)
                ))
        return sessions
    except Exception as e:
        logging.warning(f'An exception occured while executing get_session_data: {e}')
        return []
        