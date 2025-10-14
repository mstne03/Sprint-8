import logging
from datetime import datetime
from sqlmodel import Session, select
from f1_api.models.f1_schemas import Events, Seasons, Sessions, Teams, Drivers
from f1_api.controllers.session_results_controller import get_session_results
from f1_api.controllers.teams_controller import get_team_data
from f1_api.controllers.events_controller import get_event_data
from f1_api.controllers.sessions_controller import get_session_data
from f1_api.controllers.drivers_controller import get_driver_data
from f1_api.controllers.driver_team_link_controller import get_all_driver_team_links

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

            events: list[Events] = get_event_data(session,year)
            sessions: list[Sessions] = get_session_data(session,year)
            teams: list[Teams] = get_team_data(session)

            session.add_all([*events,*sessions,*teams])

            drivers: list[Drivers] = get_driver_data(session)
            
            session.add_all(drivers)
            session.commit()
            
            all_driver_team_links = get_all_driver_team_links(session,year)
            session.add_all(all_driver_team_links)
            session.commit()

            all_session_results = get_session_results(year, session)
            session.add_all(all_session_results)
            session.commit()
            session.close()
    except Exception as e:
        logging.warning(f'During the execution of update_db function, the following exception ocurred: {e}')
