import logging
from datetime import datetime
import fastf1 as ff1
from sqlmodel import Session, select
from f1_api.models.f1_models import Events, Seasons, SessionResult, Sessions, Teams, Drivers, DriverTeamLink
#from .sessions.ff1_sessions_load import load_sessions
from f1_api.data_sources.ff1_client import load_sessions
from f1_api.models.repositories.sessions_results_repository import get_all_registered_rounds
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
            # Fix: Get existing rounds properly as a set of round numbers
            existing_rounds = get_all_registered_rounds()

            if not season_exists:
                session.add(Seasons(year=year))
                session.commit()

            schedule = ff1.get_event_schedule(year)
            logging.info("✅ Schedule loaded successfully")

            session_map = load_sessions(year,existing_rounds)
            logging.info(f"✅ Sessions loaded. Session map has {len(session_map)} entries")

            events: list[Events] = get_event_data(year,schedule,session)
            logging.info(f"✅ Events processed: {len(events)} events")
            
            sessions: list[Sessions] = get_session_data(year,schedule,session)
            logging.info(f"✅ Sessions processed: {len(sessions)} sessions")
            
            logging.info("🔄 Starting team data processing...")
            teams: list[Teams] = get_team_data(schedule,session_map,session)
            logging.info(f"✅ Teams processed: {len(teams)} teams")

            session.add_all([*events,*sessions,*teams])
            logging.info("✅ Events, sessions and teams added to database session")

            logging.info("🔄 Starting driver data processing...")
            drivers: list[Drivers] = get_driver_data(schedule,session_map,session,year)
            logging.info(f"✅ Drivers processed: {len(drivers)} drivers")
            
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
            logging.info("✅ Driver data committed to database")

                    
            driver_id_map = {driver.driver_number: driver.id for driver in all_drivers}
            team_id_map = {team.team_name: team.id for team in all_teams}
            
            logging.info("🔄 Starting driver-team links processing...")
            all_driver_team_links = get_all_driver_team_links(year, schedule, session_map, driver_id_map, team_id_map, session)
            logging.info(f"✅ Driver-team links processed: {len(all_driver_team_links)} links")
            
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
            logging.info("✅ Driver colors updated")

            logging.info("🔄 Starting session results processing...")
            all_session_results = get_session_results(year, schedule, session_map, driver_id_map, team_id_map, session)
            logging.info(f"✅ Session results processed: {len(all_session_results)} results")
            
            # Only add new results if there are any
            if all_session_results:
                session.add_all(all_session_results)
                session.commit()
                logging.info(f"✅ Added {len(all_session_results)} new session results to database")
            else:
                logging.info("ℹ️ No new session results to add")
                
            session.close()
            logging.info("🎉 Database update completed successfully!")
    except Exception as e:
        logging.warning(f'During the execution of update_db function, the following exception ocurred: {e}')
