import logging
from typing import cast
import fastf1 as ff1
from sqlmodel import Session, select
from f1_api.models.f1_models import Events, Seasons, SessionDriverLink, Sessions, Teams, Drivers, EventSessionLink, DriverTeamLink, SessionTeamLink
from .teams.ff1_team_data import get_team_data
from .events.ff1_event_data import get_event_data
from .sessions.ff1_sessions_data import get_session_data
from .drivers.ff1_drivers_data import get_driver_data
from .links.ff1_driver_team_link import get_all_driver_team_links
from .links.ff1_session_result import get_session_results

async def update_db(engine,year:int):
    try:
        with Session(engine) as session:
            existing = session.exec(select(Seasons).where(Seasons.year == year)).first()
            if not existing:
                session.add(Seasons(year=year))
                session.commit()

            schedule = ff1.get_event_schedule(year)

            session_map = {}

            for _,event in schedule.iloc[1:].iterrows():
                name = event["EventName"]
                sessions = [
                    event["Session1"],
                    event["Session2"],
                    event["Session3"],
                    event["Session4"],
                    event["Session5"]
                ]

                for session_type in session:
                    session = ff1.get_session(year=year,gp=name,identifier=session_type)
                    session.load(laps=False, telemetry=False, weather=False, messages=False)
                    session_map[(event["RoundNumber"],session_type)] = session

            events: list[Events] = get_event_data(year,schedule)
            sessions: list[Sessions] = get_session_data(year,schedule)
            teams: list[Teams] = get_team_data(year,schedule)
            drivers: list[Drivers] = get_driver_data(year)
            session.add_all([*events,*sessions,*teams,*drivers])
            session.commit()
            all_sessions: list[Sessions] = list(session.exec(select(Sessions)))
            all_teams: list[Teams] = list(session.exec(select(Teams)))
            all_drivers: list[Drivers] = list(session.exec(select(Drivers)))
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
            driver_id_map = {driver.driver_number: driver.id for driver in all_drivers}
            team_id_map = {team.team_name: team.id for team in all_teams}
            all_driver_team_links = get_all_driver_team_links(year, driver_id_map, team_id_map)
            session.add_all(all_driver_team_links)
            session.commit()
            all_session_results = get_session_results(year, driver_id_map, team_id_map)
            session.add_all(all_session_results)
            session.commit()
            session.close()
    except Exception as e:
        logging.warning(f'During the execution of update_db function, the following exception ocurred: {e}')
