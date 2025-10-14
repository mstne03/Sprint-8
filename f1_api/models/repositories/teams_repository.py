"""Gets Teams data from the DB"""
import logging
from sqlmodel import Session, select, func
from f1_api.models.f1_schemas import DriverTeamLink, SessionResult, Teams
from fastf1 import plotting

class TeamsRepository:
    """Encapsulates DB logic"""
    def __init__(self, session: Session, session_map, schedule):
        self.session = session
        self.session_map = session_map
        self.schedule = schedule
    
    def get_all_teams(self) -> list[Teams]:
        teams = list(self.session.exec(select(Teams)))
        return teams

    def get_team_id_map(self) -> dict:
        """Get all of the teams from the DB"""
        all_teams = list(self.session.exec(select(Teams)))
        team_id_map = {team.team_name: team.id for team in all_teams}
        return team_id_map
    
    def get_existing_teams(self) -> list[Teams]:
        return set(self.session.exec(
            select(Teams.team_name)
        ).all())
    
    def get_team_data(self) -> list[Teams]:
        teams = []
        added_team_names = set()
        existing_teams = set(self.session.exec(
            select(Teams.team_name)
        ).all())

        for _,event in self.schedule.iloc[1:].iterrows():
            round_number = event["RoundNumber"]
            sessions = [
                event["Session1"],
                event["Session2"],
                event["Session3"],
                event["Session4"],
                event["Session5"]
            ]

            for session_type in sessions:
                try:
                    f1_session = self.session_map.get((round_number,session_type))
                    
                    # Skip if session data not available
                    if f1_session is None:
                        continue
                    
                    try:
                        team_names = plotting.list_team_names(f1_session)
                    except Exception as e:
                        logging.warning(f'Failed to get team names for round {round_number}, session {session_type}: {e}')
                        continue

                    for name in team_names:
                        if name in existing_teams:
                            continue
                        if name in added_team_names:
                            continue
                        
                        added_team_names.add(name)

                        try:
                            team_color = plotting.get_team_color(name, f1_session)
                        except Exception as e:
                            logging.warning(f'Failed to get color for team {name}: {e}')
                            team_color = "#FFFFFF"  # Default color
                        
                        teams.append(Teams(
                            team_name=name,
                            team_color=team_color
                        ))
                except Exception as e:
                    logging.warning(f'Error processing session {session_type} for round {round_number}: {e}')
                    continue  # Continue with next session instead of returning
        return teams
    
    def get_team_points_data(self) -> list:
        """Get aggregated points data for all teams"""
        return self.session.exec(
            select(
                DriverTeamLink.team_id,
                DriverTeamLink.driver_id,
                DriverTeamLink.round_number,
                func.sum(SessionResult.points).label("round_points")
            )
            .join(SessionResult,
                (SessionResult.driver_id == DriverTeamLink.driver_id) &
                (SessionResult.round_number == DriverTeamLink.round_number))
            .group_by(
                DriverTeamLink.team_id,
                DriverTeamLink.driver_id,
                DriverTeamLink.round_number
            )
        ).all()

def get_team_data(session,session_map,schedule):
    teams_repo = TeamsRepository(session,session_map,schedule)
    return teams_repo.get_team_data()

def get_team_id_map(session,session_map,schedule):
    teams_repo = TeamsRepository(session,session_map,schedule)
    return teams_repo.get_team_id_map()
