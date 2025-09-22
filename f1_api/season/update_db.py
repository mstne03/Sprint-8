import logging
from datetime import datetime
import fastf1 as ff1
from sqlmodel import Session, select
from f1_api.models.f1_models import Events, Seasons, SessionResult, Sessions, Teams, Drivers, DriverTeamLink
from .sessions.ff1_sessions_load import load_sessions
from .teams.ff1_team_data import get_team_data
from .events.ff1_event_data import get_event_data
from .sessions.ff1_sessions_data import get_session_data
from .drivers.ff1_drivers_data import get_driver_data
from .links.ff1_driver_team_link import get_all_driver_team_links
from .links.ff1_session_result import get_session_results



logging.basicConfig(level=logging.INFO)

async def update_db(engine):
    """
    Adds all the models to the sql session and pushes them inteo the DB
    """
    try:
        year = datetime.now().year

        with Session(engine) as session:
            season_exists = session.exec(select(Seasons).where(Seasons.year == year)).first()
            existing_rounds = set(session.exec(select(SessionResult.round_number)).all())

            if not season_exists:
                session.add(Seasons(year=year))
                session.commit()

            schedule = ff1.get_event_schedule(year)

            session_map = load_sessions(year,schedule,existing_rounds)

            events: list[Events] = get_event_data(year,schedule,session)
            sessions: list[Sessions] = get_session_data(year,schedule,session)
            teams: list[Teams] = get_team_data(schedule,session_map,session)

            session.add_all([*events,*sessions,*teams])

            drivers: list[Drivers] = get_driver_data(schedule,session_map,session,year)
            
            for driver in drivers:
                existing = session.exec(select(Drivers).where(Drivers.driver_number == driver.driver_number)).first()
                if existing:
                    existing.driver_color = driver.driver_color
                    existing.headshot_url = driver.headshot_url
                    session.add(existing)
                else:
                    session.add(driver)
            
            session.commit()
            all_teams: list[Teams] = list(session.exec(select(Teams)))
            all_drivers: list[Drivers] = list(session.exec(select(Drivers)))

                    
            driver_id_map = {driver.driver_number: driver.id for driver in all_drivers}
            team_id_map = {team.team_name: team.id for team in all_teams}
            all_driver_team_links = get_all_driver_team_links(year, schedule, session_map, driver_id_map, team_id_map, session)
            session.add_all(all_driver_team_links)
            session.commit()

            current_driver_team_links = list(session.exec(select(DriverTeamLink)))

            latest_links = {}

            for link in current_driver_team_links:
                if (link.driver_id not in latest_links) or (link.round_number > latest_links[link.driver_id].round_number):
                    latest_links[link.driver_id] = link

            for driver_id, link in latest_links.items():
                driver = session.exec(select(Drivers).where(Drivers.id == driver_id)).first()
                team = session.exec(select(Teams).where(Teams.id == link.team_id)).first()

                if driver.driver_color != team.team_color:
                    driver.driver_color = team.team_color
                    session.add(driver)
            session.commit()

            all_session_results = get_session_results(year, schedule, session_map, driver_id_map, team_id_map, session)
            session.add_all(all_session_results)
            session.commit()
            session.close()
    except Exception as e:
        logging.warning(f'During the execution of update_db function, the following exception ocurred: {e}')
