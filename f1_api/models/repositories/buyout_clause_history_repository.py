from sqlmodel import Session, select
from f1_api.models.app_models import BuyoutClauseHistory

class BuyoutClauseHistoryRepository:
    def __init__(self, session: Session):
        self.session = session
    
    def count_buyouts_between_users(
        self, 
        buyer_id: int, 
        victim_id: int, 
        league_id: int, 
        season_year: int
    ) -> int:
        """
        Count how many buyouts have been executed between two users in a league/season.
        Used to enforce buyout limits.
        """
        result = self.session.exec(
            select(BuyoutClauseHistory).where(
                BuyoutClauseHistory.league_id == league_id,
                BuyoutClauseHistory.buyer_id == buyer_id,
                BuyoutClauseHistory.victim_id == victim_id,
                BuyoutClauseHistory.season_year == season_year
            )
        ).all()
        return len(result)
    
    def get_all_buyouts_in_league(self, league_id: int) -> list[BuyoutClauseHistory]:
        """Get all buyout history for a league."""
        return self.session.exec(
            select(BuyoutClauseHistory).where(
                BuyoutClauseHistory.league_id == league_id
            )
        ).all()
    
    def get_user_buyouts_executed(self, user_id: int, league_id: int) -> list[BuyoutClauseHistory]:
        """Get all buyouts executed BY a user."""
        return self.session.exec(
            select(BuyoutClauseHistory).where(
                BuyoutClauseHistory.league_id == league_id,
                BuyoutClauseHistory.buyer_id == user_id
            )
        ).all()
    
    def get_user_buyouts_suffered(self, user_id: int, league_id: int) -> list[BuyoutClauseHistory]:
        """Get all buyouts suffered BY a user."""
        return self.session.exec(
            select(BuyoutClauseHistory).where(
                BuyoutClauseHistory.league_id == league_id,
                BuyoutClauseHistory.victim_id == user_id
            )
        ).all()
    
    def create(self, buyout: BuyoutClauseHistory) -> BuyoutClauseHistory:
        """Create a new buyout history record."""
        self.session.add(buyout)
        return buyout
