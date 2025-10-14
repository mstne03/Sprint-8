import secrets
import string
from sqlmodel import Session, select
from f1_api.models.app_models import LeagueCreate, LeagueJoin, Leagues

class LeaguesRepository:
    def __init__(self,  session: Session):
        self.session = session

    def create_join_code(self, length: int = 8):
        characters = string.ascii_uppercase + string.digits
        while True:
            join_code = ''.join(secrets.choice(characters) for _ in range(length))
            existing_code = self.session.exec(
                select(Leagues).where(Leagues.join_code == join_code)
            ).first()
            if not existing_code:
                return join_code
    
    def create_league(self, user_id: int, league: LeagueCreate, join_code: str) -> Leagues:
        new_league = Leagues(
            name=league.name,
            description=league.description,
            admin_user_id=user_id,
            join_code=join_code,
            is_active=True
        )
        self.session.add(new_league)
        return new_league
    
    def get_league_by_id(self, league_id: int):
        return self.session.exec(
            select(Leagues).where(Leagues.id == league_id)
        ).first()
    
    def get_active_league(self, league_id: int):
        return self.session.exec(
            select(Leagues).where(
                Leagues.id == league_id,
                Leagues.is_active == True
            )
        ).first()

    def get_league_by_join_code(self, league_join: LeagueJoin):
        return self.session.exec(
            select(Leagues).where(
                Leagues.join_code == league_join.join_code,
                Leagues.is_active == True
            )
        ).first()
