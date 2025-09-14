import logging
from f1_api.models.f1_models import Sessions
import fastf1 as ff1

def get_session_data(year, schedule):
    try:
        sessions = []

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
        