"""
League service module for league-related business operations.

This module provides the business logic layer for league management operations,
including league creation, user membership management, participant tracking,
and league discovery. It orchestrates multiple repositories to handle complex
league-related workflows while maintaining data consistency and business rules.
"""
import logging
from sqlmodel import Session
from fastapi import HTTPException
from f1_api.models.repositories.leagues_repository import LeaguesRepository
from f1_api.models.repositories.user_league_links_repository import UserLeagueLinksRepository
from f1_api.models.repositories.user_teams_repository import UserTeamsRepository
from f1_api.models.repositories.users_repository import UserRepository
from f1_api.models.app_models import (
    LeagueJoin, LeagueCreate, LeagueResponse
)

class LeagueService:
    """
    Service class for managing league business operations.
    
    This service orchestrates multiple repositories to handle complex league operations
    including creation, membership management, user participation tracking, and team
    management. It enforces business rules, manages transactional operations across
    multiple entities, and provides a clean API for league-related functionality.
    
    The service handles:
    - League creation with automatic admin membership
    - User membership validation and access control
    - Join code based league discovery and joining
    - Participant tracking and league statistics
    - Team management integration for league departures
    """
    def __init__(self, session: Session):
        """
        Initialize the LeagueService with required repository dependencies.
        
        Sets up all necessary repositories for league operations including
        user management, league data access, membership tracking, and team management.
        
        Args:
            session: SQLModel database session for repository operations
        """
        self.session = session
        self.repository = LeaguesRepository(session)
        self.user_repository = UserRepository(session)
        self.user_teams_repository = UserTeamsRepository(session)
        self.user_league_links_repository = UserLeagueLinksRepository(session)
    def create_league(self, user_id: str, league: LeagueCreate) -> LeagueResponse:
        """
        Create a new league and return response

        Args:
            user_id: Supabase user ID of the requesting user
        
        Returns:
            LeagueResponse: League data with participant count set to 1
        
        Raises HTTPException if User not found
        """
        user = self.user_repository.check_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        try:
            join_code = self.repository.create_join_code()
            new_league = self.repository.create_league(user.id, league, join_code)
            
            # Flush para obtener el ID sin commit completo
            self.session.flush()
            self.session.refresh(new_league)
            
            # Ahora crear membership con league.id disponible
            self.user_league_links_repository.create_membership(user.id, new_league)
            
            # Commit final para ambas operaciones
            self.session.commit()
            
            return LeagueResponse(
                id=new_league.id,
                name=new_league.name,
                description=new_league.description,
                admin_user_id=new_league.admin_user_id,
                is_active=new_league.is_active,
                join_code=new_league.join_code,
                current_participants=1,
                created_at=new_league.created_at
            )
        except Exception as e:
            self.session.rollback()
            logging.error(f"Failed to create league for user {user_id}: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to create league: {str(e)}")
    def get_league_by_id(self, league_id: int, user_id: str) -> LeagueResponse:
        """
        Get details of a specific league by ID - only for league participants
        
        Args:
            league_id: ID of the league to retrieve
            user_id: Supabase user ID of the requesting user
            
        Returns:
            LeagueResponse: League data with participant count
            
        Raises:
            HTTPException: If user not found, league not found, or access denied
        """
        logging.info(f"Getting league {league_id} for user {user_id}")
        
        user = self.user_repository.check_user_by_id(user_id)
        if not user:
            logging.error(f"User not found: {user_id}")
            raise HTTPException(status_code=404, detail="User not found")
        
        logging.info(f"Found user with internal ID: {user.id}")
        
        league = self.repository.get_league_by_id(league_id)
        if not league:
            logging.error(f"League not found: {league_id}")
            raise HTTPException(status_code=404, detail="League not found")
            
        logging.info(f"Found league: {league.name}")
        
        user_membership = self.user_league_links_repository.get_active_membership(league_id, user.id)
        if not user_membership:
            logging.warning(f"User {user.id} is not a member of league {league_id}")
            raise HTTPException(status_code=403, detail="Access denied: You are not a member of this league")
            
        logging.info(f"User {user.id} has active membership in league {league_id}")
        
        participants_count = self.user_league_links_repository.get_current_participants(league_id)
        return LeagueResponse(
            id=league.id,
            name=league.name,
            description=league.description,
            admin_user_id=league.admin_user_id,
            is_active=league.is_active,
            join_code=league.join_code,
            current_participants=len(participants_count),
            created_at=league.created_at
        )
    def get_user_leagues(self, user_id: str) -> list:
        """
        Get all leagues where the user is a participant
        
        Args:
            user_id: Supabase user ID of the requesting user
            
        Returns:
            list[LeagueResponse]: List of leagues where user is a participant
            
        Raises:
            HTTPException: If user not found or other errors occur
        """
        logging.info(f"Getting leagues for user: {user_id}")
        response_leagues = []
        
        user = self.user_repository.check_user_by_id(user_id)
        if not user:
            logging.error(f"User not found: {user_id}")
            raise HTTPException(status_code=404, detail="User not found")
        
        logging.info(f"Found user with internal ID: {user.id}")
        user_active_leagues = self.user_league_links_repository.get_user_active_leagues(user.id)
        logging.info(f"Found {len(user_active_leagues) if user_active_leagues else 0} active leagues for user {user.id}")
        
        if not user_active_leagues:
            logging.warning(f"No active leagues found for user {user_id} (internal ID: {user.id})")
            return []
            
        for league, _ in user_active_leagues:
            logging.info(f"Processing league {league.id}: {league.name}")
            participants_count = self.user_league_links_repository.get_current_participants(league.id)
            response_leagues.append(LeagueResponse(
                id=league.id,
                name=league.name,
                description=league.description,
                admin_user_id=league.admin_user_id,
                is_active=league.is_active,
                join_code=league.join_code,
                current_participants=len(participants_count),
                created_at=league.created_at
            ))
        
        logging.info(f"Returning {len(response_leagues)} leagues for user {user_id}")
        return response_leagues
    def join_league(self, league_join: LeagueJoin, user_id: str) -> dict:
        """
        Join a league using join code
        
        Args:
            league_join: LeagueJoin object with join code
            user_id: Supabase user ID of the user joining
            
        Returns:
            dict: Success message with league information
            
        Raises:
            HTTPException: If user not found, league not found, or user already a member
        """
        user = self.user_repository.check_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        league = self.repository.get_league_by_join_code(league_join)
        if not league:
            raise HTTPException(status_code=404, detail="League not found or inactive")
        user_membership = self.user_league_links_repository.get_membership(league.id, user.id)
        if user_membership:
            if user_membership.is_active:
                raise HTTPException(status_code=409, detail="User is already a member of this league")
            self.user_league_links_repository.reactivate_membership(user_membership)
            return {"message": "Successfully rejoined league", "league_id": league.id}
        self.user_league_links_repository.create_membership(user.id,league)
        return {"message": "Successfully joined league", "league_id": league.id}
    def get_league_participants(self, league_id: int) -> dict:
        """
        Get all participants of a specific league
        
        Args:
            league_id: ID of the league to get participants for
            
        Returns:
            dict: League information with participants list
            
        Raises:
            HTTPException: If league not found or other errors occur
        """
        logging.info(f"Getting participants for league {league_id}")
        participants = []
        
        league = self.repository.get_active_league(league_id)
        if not league:
            logging.error(f"League {league_id} not found or inactive")
            raise HTTPException(status_code=404, detail="League not found or inactive")
            
        logging.info(f"Found league: {league.name}")
        
        participants_data = self.user_league_links_repository.get_league_participants(league_id)
        logging.info(f"Found {len(participants_data)} participants for league {league_id}")
        
        for user, link in participants_data:
            participants.append({
                "user_id": user.id,
                "user_name": user.user_name,
                "email": user.email,
                "is_admin": link.is_admin,
                "joined_at": link.joined_at
            })
            
        logging.info(f"Returning {len(participants)} participants for league {league_id}")
        return {
            "league_id": league_id,
            "league_name": league.name,
            "participants": participants,
            "total_participants": len(participants)
        }
    def leave_league(self, league_id: int, user_id: str) -> dict:
        """
        Remove user from a league (leave league) and delete their team
        
        Args:
            league_id: ID of the league to leave
            user_id: Supabase user ID of the user leaving
            
        Returns:
            dict: Success message with league information
            
        Raises:
            HTTPException: If user not found, league not found, or user not a member
        """
        user = self.user_repository.check_user_by_id(user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        league = self.repository.get_league_by_id(league_id)
        if not league:
            raise HTTPException(status_code=404, detail="League not found")
        user_membership = self.user_league_links_repository.get_active_membership(league_id, user.id)
        if not user_membership:
            raise HTTPException(status_code=404, detail="User is not a member of this league")
        self.user_league_links_repository.deactivate_membership(user_membership)
        team = self.user_teams_repository.get_active_team_by_league_and_user(user.id, league_id)
        if team:
            self.user_teams_repository.hard_delete_team(team)
        return {
            "message": f"Successfully left league '{league.name}'", 
            "league_id": league_id
        }

def create_league_service(
        league: LeagueCreate,
        admin_user_id: str,
        session: Session
    ) -> LeagueResponse:
    """Create league wrapper function"""
    service = LeagueService(session)
    return service.create_league(admin_user_id, league)

def get_league_by_id_service(league_id: int, user_id: str, session: Session) -> LeagueResponse:
    """Get league by id wrapper function"""
    service = LeagueService(session)
    return service.get_league_by_id(league_id, user_id)

def leave_league_service(league_id: int, user_id: str, session: Session) -> dict:
    """Leave league wrapper function"""
    service = LeagueService(session)
    return service.leave_league(league_id,user_id)

def get_user_leagues_service(user_id: str, session: Session) -> list[LeagueResponse]:
    """Get all leagues for a particular user wrapper function"""
    service = LeagueService(session)
    return service.get_user_leagues(user_id)

def join_league_service(league_join: LeagueJoin, user_id: str, session: Session) -> dict:
    """Join league with join code wrapper function"""
    service = LeagueService(session)
    return service.join_league(league_join,user_id)

def get_league_participants_service(league_id: int, session: Session) -> dict:
    """Get all league participants wrapper function"""
    service = LeagueService(session)
    return service.get_league_participants(league_id)
