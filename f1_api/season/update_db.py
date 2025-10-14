import logging
from datetime import datetime
from sqlmodel import Session, select
from f1_api.models.f1_schemas import Events, Seasons, Sessions, Teams, Drivers
from f1_api.data_sources.ff1_client import FastF1Client
from f1_api.data_sources.ff1_client import load_sessions
from f1_api.models.repositories.sessions_results_repository import get_all_registered_rounds, get_session_results
from f1_api.services.teams_service import get_team_data, get_team_id_map
from f1_api.models.repositories.events_repository import get_event_data
from f1_api.models.repositories.session_repository import get_session_data
from f1_api.models.repositories.drivers_repository import get_driver_data, get_drivers_id_map
from f1_api.models.repositories.driver_team_link_repository import get_all_driver_team_links

logging.basicConfig(level=logging.INFO)

async def update_db(engine):
    """
    Adds all the models to the sql session and pushes them inteo the DB
    """
    try:
        year = datetime.now().year

        with Session(engine) as session:
            season_exists = session.exec(select(Seasons).where(Seasons.year == year)).first()
            if not season_exists:
                session.add(Seasons(year=year))
                session.commit()
            schedule = FastF1Client.get_event_schedule(year)
            existing_rounds = get_all_registered_rounds(year, session, schedule)

            session_map = load_sessions(year,existing_rounds)

            events: list[Events] = get_event_data(session,year,schedule)
            sessions: list[Sessions] = get_session_data(session,year,schedule)
            teams: list[Teams] = get_team_data(session)

            session.add_all([*events,*sessions,*teams])

            drivers: list[Drivers] = get_driver_data(session,year,session_map,schedule)
            
            session.add_all(drivers)   
            session.commit()

            driver_id_map = get_drivers_id_map(session)
            team_id_map = get_team_id_map(session)
            
            all_driver_team_links = get_all_driver_team_links(year, schedule, session_map, driver_id_map, team_id_map, session)
            session.add_all(all_driver_team_links)
            session.commit()

            all_session_results = get_session_results(year, session, schedule, session_map, driver_id_map, team_id_map)
            session.add_all(all_session_results)
            session.commit()
            session.close()
    except Exception as e:
        logging.warning(f'During the execution of update_db function, the following exception ocurred: {e}')
