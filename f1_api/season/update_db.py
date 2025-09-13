import logging
from sqlmodel import Session, select
from ..models.f1_models import Seasons, SessionDriverLink, Sessions, Teams, Drivers, EventSessionLink, DriverTeamLink, SessionTeamLink
import fastf1 as ff1
from .teams.ff1_team_data import get_team_data
from .events.ff1_event_data import get_event_data
from .sessions.ff1_sessions_data import get_session_data
from .drivers.ff1_drivers_data import get_driver_data

async def update_db(engine,year:int):
    try:
        schedule = ff1.get_event_schedule(year)

        with Session(engine) as session:
            existing = session.exec(select(Seasons).where(Seasons.year == year)).first()
            if not existing:
                session.add(Seasons(year=year))
                session.commit()

            events = get_event_data(schedule, year)
            sessions = get_session_data(schedule, year)
            teams = get_team_data(schedule, year)
            drivers = get_driver_data(schedule, year)

            session.add_all([*events,*sessions,*teams,*drivers])

            session.commit()

            all_sessions = list(session.exec(select(Sessions)))
            all_teams = list(session.exec(select(Teams)))
            all_drivers = list(session.exec(select(Drivers)))

            driver_team_links = set()
            for s in all_sessions:
                session.add(EventSessionLink(
                    round_number=s.round_number,
                    season_id=s.season_id,
                    session_number=s.session_number
                ))
                for team in all_teams:
                    session.add(SessionTeamLink(
                        event_id=s.round_number,
                        season_id=s.season_id,
                        session_number=s.session_number,
                        team_id=team.id
                    ))
                    for driver in all_drivers:
                        key = (driver.id, team.id, year, s.round_number)
                        if key not in driver_team_links:
                            session.add(DriverTeamLink(
                                driver_id=driver.id,
                                team_id=team.id,
                                season_id=year,
                                round_number=s.round_number
                            ))
                            driver_team_links.add(key)
            session.commit()
    except Exception as e:
        logging.warning(f'During the execution of update_db function, the following exception ocurred: {e}')

