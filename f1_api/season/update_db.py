import logging
import fastf1 as ff1
from sqlmodel import Session, select
from f1_api.models.f1_models import Events, Seasons, SessionResult, Sessions, Teams, Drivers, DriverTeamLink
from .teams.ff1_team_data import get_team_data
from .events.ff1_event_data import get_event_data
from .sessions.ff1_sessions_data import get_session_data
from .drivers.ff1_drivers_data import get_driver_data
from .links.ff1_driver_team_link import get_all_driver_team_links
from .links.ff1_session_result import get_session_results

class SessionLoadError(Exception):
    pass

logging.basicConfig(level=logging.INFO)

async def update_db(engine,year:int):
    try:
        with Session(engine) as session:
            season_exists = session.exec(select(Seasons).where(Seasons.year == year)).first()
            existing_rounds = set(session.exec(select(SessionResult.round_number)).all())

            if not season_exists:
                session.add(Seasons(year=year))
                session.commit()

            schedule = ff1.get_event_schedule(year)

            session_map = {}

            try:
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
            except SessionLoadError:
                logging.warning("Stopped loading further sessions")

            events: list[Events] = get_event_data(year,schedule)
            sessions: list[Sessions] = get_session_data(year,schedule)
            teams: list[Teams] = get_team_data(schedule,session_map)
            drivers: list[Drivers] = get_driver_data(schedule,session_map)
            session.add_all([*events,*sessions,*teams,*drivers])
            session.commit()
            #all_sessions: list[Sessions] = list(session.exec(select(Sessions).where(Sessions.season_id == year)))
            all_teams: list[Teams] = list(session.exec(select(Teams)))
            all_drivers: list[Drivers] = list(session.exec(select(Drivers)))

                    
            driver_id_map = {driver.driver_number: driver.id for driver in all_drivers}
            team_id_map = {team.team_name: team.id for team in all_teams}
            all_driver_team_links = get_all_driver_team_links(year, schedule, session_map, driver_id_map, team_id_map, session)
            session.add_all(all_driver_team_links)
            session.commit()
            all_session_results = get_session_results(year, schedule, session_map, driver_id_map, team_id_map, session)
            session.add_all(all_session_results)
            session.commit()
            session.close()
    except Exception as e:
        logging.warning(f'During the execution of update_db function, the following exception ocurred: {e}')
