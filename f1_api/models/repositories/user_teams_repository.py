from sqlmodel import Session, select
from f1_api.models.app_models import UserTeams

class UserTeamsRepository:
    def __init__(self, session: Session):
        self.session = session
    
    def get_active_team_by_league_and_user(self, user_id: int, league_id: int):
        return self.session.exec(
            select(UserTeams).where(
                UserTeams.user_id == user_id,
                UserTeams.league_id == league_id,
                UserTeams.is_active == True
            )
        ).first()
    
    def soft_delete_team(self, team: UserTeams):
        team.is_active = False
        self.session.add(team)
        # Note: Commit is handled by the calling controller's context manager
    
    def hard_delete_team(self, team: UserTeams):
        self.session.delete(team)
        # Note: Commit is handled by the calling controller's context manager