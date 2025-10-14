"""
UserLeagueLinks repository module for managing user-league memberships.

This module provides data access operations for UserLeagueLink entities,
handling the many-to-many relationship between users and leagues including
membership status, admin privileges, and participation tracking.
"""
from sqlmodel import Session, select
from f1_api.models.app_models import Leagues, UserLeagueLink, Users

class UserLeagueLinksRepository:
    """
    Repository for managing user-league membership relationships.
    
    This repository handles all database operations related to UserLeagueLink entities,
    including creating memberships, managing membership status (active/inactive),
    and querying membership data for both users and leagues.
    """
    def __init__(self, session: Session):
        """
        Initialize the UserLeagueLinksRepository with a database session.
        
        Args:
            session: SQLModel database session for executing queries
        """
        self.session = session
    def create_membership(self, user_id: int, league: Leagues):
        """
        Create a new membership relationship between a user and league.
        
        Creates an active admin membership for the specified user in the given league.
        This is typically used when a user creates a new league.
        
        Args:
            user_id: Numeric ID of the user to add as member
            league: League entity object to create membership for
            
        Raises:
            SQLAlchemyError: If database operation fails
        """
        league_link = UserLeagueLink(
            user_id=user_id,
            league_id=league.id,
            is_admin=True,
            is_active=True
        )
        self.session.add(league_link)
    def reactivate_membership(self, existing_membership: UserLeagueLink):
        """
        Reactivate an existing inactive membership.
        
        Sets the is_active flag to True for a previously deactivated membership,
        allowing the user to rejoin a league they had left.
        
        Args:
            existing_membership: UserLeagueLink entity to reactivate
            
        Raises:
            SQLAlchemyError: If database operation fails
        """
        existing_membership.is_active = True
        self.session.add(existing_membership)
        self.session.commit()
    def get_active_membership(self, league_id: int, user_id: int):
        """
        Retrieve an active membership for a specific user in a league.
        
        Returns the UserLeagueLink entity if the user has an active membership
        in the specified league, None otherwise.
        
        Args:
            league_id: ID of the league to check membership for
            user_id: Numeric ID of the user to check
            
        Returns:
            UserLeagueLink or None: Active membership entity if found
        """
        return self.session.exec(
            select(UserLeagueLink).where(
                UserLeagueLink.league_id == league_id,
                UserLeagueLink.user_id == user_id,
                UserLeagueLink.is_active == True
            )
        ).first()
    def get_membership(self, league_id: int, user_id: int):
        """
        Retrieve any membership (active or inactive) for a user in a league.
        
        Returns the UserLeagueLink entity regardless of active status,
        useful for checking if a user has ever been a member of a league.
        
        Args:
            league_id: ID of the league to check membership for
            user_id: Numeric ID of the user to check
            
        Returns:
            UserLeagueLink or None: Membership entity if found (any status)
        """
        return self.session.exec(
            select(UserLeagueLink).where(
                UserLeagueLink.league_id == league_id,
                UserLeagueLink.user_id == user_id
            )
        ).first()
    def get_current_participants(self, league_id: int):
        """
        Get all active participants in a specific league.
        
        Returns a list of UserLeagueLink entities for all users who are
        currently active members of the specified league.
        
        Args:
            league_id: ID of the league to get participants for
            
        Returns:
            list[UserLeagueLink]: List of active membership entities
        """
        return self.session.exec(
            select(UserLeagueLink).where(
                UserLeagueLink.league_id == league_id,
                UserLeagueLink.is_active == True
            )
        ).fetchall()
    def get_user_active_leagues(self, user_id: int):
        """
        Get all active leagues for a specific user with league details.
        
        Returns a list of tuples containing League and UserLeagueLink entities
        for all leagues where the user has an active membership.
        
        Args:
            user_id: Numeric ID of the user to get leagues for
            
        Returns:
            list[tuple[Leagues, UserLeagueLink]]: List of (league, membership) tuples
        """
        leagues_query = (
            select(Leagues, UserLeagueLink)
            .join(UserLeagueLink, Leagues.id == UserLeagueLink.league_id)
            .where(
                UserLeagueLink.user_id == user_id,
                UserLeagueLink.is_active == True,
                Leagues.is_active == True
            )
        )
        
        result = self.session.exec(leagues_query).all()
        
        return result
    def get_league_participants(self, league_id: int):
        """
        Get all active participants in a league with user details.
        
        Returns a list of tuples containing User and UserLeagueLink entities
        for all active members of the specified league, including user information.
        
        Args:
            league_id: ID of the league to get participants for
            
        Returns:
            list[tuple[Users, UserLeagueLink]]: List of (user, membership) tuples
        """
        participants_query = (
            select(Users, UserLeagueLink)
            .join(UserLeagueLink, Users.id == UserLeagueLink.user_id)
            .where(
                UserLeagueLink.league_id == league_id,
                UserLeagueLink.is_active == True
            )
        )
        return self.session.exec(participants_query).all()
    def deactivate_membership(self, user_league_link: UserLeagueLink):
        """
        Deactivate an existing membership.
        
        Sets the is_active flag to False for the specified membership,
        effectively removing the user from the league without deleting the record.
        
        Args:
            user_league_link: UserLeagueLink entity to deactivate
            
        Raises:
            SQLAlchemyError: If database operation fails
        """
        user_league_link.is_active = False
        self.session.add(user_league_link)
        self.session.commit()
