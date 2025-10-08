"""Leagues controller - HTTP handlers for leagues endpoints"""
from typing import List
from fastapi import HTTPException
from sqlmodel import Session
from f1_api.models.app_models import LeagueCreate, LeagueResponse, LeagueJoin
from f1_api.models.business.leagues_model import LeaguesModel


class LeaguesController:
    """HTTP controller for leagues endpoints"""
    
    def __init__(self):
        self.leagues_model = LeaguesModel()
    
    async def create_league(self, league: LeagueCreate, admin_user_id: str, session: Session) -> LeagueResponse:
        """
        HTTP handler for POST /leagues/ endpoint
        
        Args:
            league: League creation data
            admin_user_id: ID of the user creating the league
            session: Database session
            
        Returns:
            Created league data
            
        Raises:
            HTTPException: If error occurs
        """
        try:
            return self.leagues_model.create_league(league, admin_user_id, session)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error creating league: {str(e)}") from e
    
    async def get_league_by_id(self, league_id: int, user_id: str, session: Session) -> LeagueResponse:
        """
        HTTP handler for GET /leagues/{league_id} endpoint
        
        Args:
            league_id: League ID
            user_id: User ID making the request
            session: Database session
            
        Returns:
            League data
            
        Raises:
            HTTPException: If error occurs
        """
        try:
            return self.leagues_model.get_league_by_id(league_id, user_id, session)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching league: {str(e)}") from e
    
    async def leave_league(self, league_id: int, user_id: str, session: Session) -> dict:
        """
        HTTP handler for DELETE /leagues/{league_id}/leave endpoint
        
        Args:
            league_id: League ID
            user_id: User ID leaving the league
            session: Database session
            
        Returns:
            Success message
            
        Raises:
            HTTPException: If error occurs
        """
        try:
            return self.leagues_model.leave_league(league_id, user_id, session)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error leaving league: {str(e)}") from e
    
    async def get_user_leagues(self, user_id: str, session: Session) -> List[LeagueResponse]:
        """
        HTTP handler for GET /leagues/user/{user_id} endpoint
        
        Args:
            user_id: User ID
            session: Database session
            
        Returns:
            List of user's leagues
            
        Raises:
            HTTPException: If error occurs
        """
        try:
            return self.leagues_model.get_user_leagues(user_id, session)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching user leagues: {str(e)}") from e
    
    async def join_league(self, league_join: LeagueJoin, user_id: str, session: Session) -> dict:
        """
        HTTP handler for POST /leagues/join/ endpoint
        
        Args:
            league_join: League join data
            user_id: User ID joining the league
            session: Database session
            
        Returns:
            Success message
            
        Raises:
            HTTPException: If error occurs
        """
        try:
            return self.leagues_model.join_league(league_join, user_id, session)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error joining league: {str(e)}") from e
    
    async def get_league_participants(self, league_id: int, session: Session) -> dict:
        """
        HTTP handler for GET /leagues/{league_id}/participants endpoint
        
        Args:
            league_id: League ID
            session: Database session
            
        Returns:
            League participants data
            
        Raises:
            HTTPException: If error occurs
        """
        try:
            return self.leagues_model.get_league_participants(league_id, session)
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Error fetching league participants: {str(e)}") from e


# Global instance
leagues_controller = LeaguesController()