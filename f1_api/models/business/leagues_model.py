"""Leagues business model - Contains all leagues-related business logic and CRUD operations"""
import logging
import secrets
import string
from typing import List, Dict, Any
from sqlmodel import select, Session
from fastapi import HTTPException
from f1_api.models.app_models import (
    Users, Leagues, LeagueCreate, LeagueResponse, UserLeagueLink, LeagueJoin
)


class LeaguesModel:
    """Business model for leagues operations with all CRUD and business logic"""
    
    def __init__(self):
        self.logger = logging.getLogger(__name__)
    
    def generate_join_code(self, length: int = 8) -> str:
        """
        Generate a unique join code for leagues
        Business logic for creating secure join codes
        
        Args:
            length: Length of the join code
            
        Returns:
            Unique join code string
        """
        characters = string.ascii_uppercase + string.digits
        return ''.join(secrets.choice(characters) for _ in range(length))
    
    def create_league(self, league: LeagueCreate, admin_user_id: str, session: Session) -> LeagueResponse:
        """
        Create a new league and automatically add the creator as admin
        Contains all business logic for league creation
        
        Args:
            league: LeagueCreate object with league data
            admin_user_id: Supabase user ID of the admin
            session: Database session
            
        Returns:
            LeagueResponse: Created league data
            
        Raises:
            HTTPException: If user not found or other errors occur
        """
        try:
            # Business logic: Verify user exists by supabase_user_id
            user = session.exec(
                select(Users).where(Users.supabase_user_id == admin_user_id)
            ).first()
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Business logic: Generate unique join code
            join_code = self.generate_join_code()
            while session.exec(
                select(Leagues).where(Leagues.join_code == join_code)
            ).first():
                join_code = self.generate_join_code()  # Regenerate if exists
            
            # Business logic: Create league using the numeric user id
            new_league = Leagues(
                name=league.name,
                description=league.description,
                admin_user_id=user.id,
                join_code=join_code,
                is_active=True
            )
            
            session.add(new_league)
            session.commit()
            session.refresh(new_league)
            
            # Business logic: Add creator as admin member using numeric user id
            league_link = UserLeagueLink(
                user_id=user.id,
                league_id=new_league.id,
                is_admin=True,
                is_active=True
            )
            
            session.add(league_link)
            session.commit()
            
            # Transform to response format with business logic
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
            
        except HTTPException:
            raise
        except Exception as e:
            self.logger.error("Error creating league: %s", e)
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_league_by_id(self, league_id: int, user_id: str, session: Session) -> LeagueResponse:
        """
        Get details of a specific league by ID - only for league participants
        Business logic for league access control
        
        Args:
            league_id: ID of the league to retrieve
            user_id: Supabase user ID of the requesting user
            session: Database session
            
        Returns:
            LeagueResponse: League details
            
        Raises:
            HTTPException: If league not found or user not authorized
        """
        try:
            # Business logic: Get user by Supabase ID
            user = session.exec(
                select(Users).where(Users.supabase_user_id == user_id)
            ).first()
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Business logic: Check if user is a participant
            user_league_link = session.exec(
                select(UserLeagueLink).where(
                    (UserLeagueLink.user_id == user.id) &
                    (UserLeagueLink.league_id == league_id) &
                    (UserLeagueLink.is_active == True)
                )
            ).first()
            
            if not user_league_link:
                raise HTTPException(
                    status_code=403, 
                    detail="User is not a participant of this league"
                )
            
            # Get league details
            league = session.exec(
                select(Leagues).where(Leagues.id == league_id)
            ).first()
            
            if not league:
                raise HTTPException(status_code=404, detail="League not found")
            
            # Business logic: Count current participants
            participants = session.exec(
                select(UserLeagueLink).where(
                    (UserLeagueLink.league_id == league_id) &
                    (UserLeagueLink.is_active == True)
                )
            ).all()
            participant_count = len(participants)
            
            return LeagueResponse(
                id=league.id,
                name=league.name,
                description=league.description,
                admin_user_id=league.admin_user_id,
                is_active=league.is_active,
                join_code=league.join_code,
                current_participants=participant_count,
                created_at=league.created_at
            )
            
        except HTTPException:
            raise
        except Exception as e:
            self.logger.error("Error fetching league: %s", e)
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def leave_league(self, league_id: int, user_id: str, session: Session) -> Dict[str, str]:
        """
        Remove user from a league (leave league)
        Business logic for league departure
        
        Args:
            league_id: League ID
            user_id: Supabase user ID leaving the league
            session: Database session
            
        Returns:
            Success message
            
        Raises:
            HTTPException: If errors occur
        """
        try:
            # Business logic: Get user by Supabase ID
            user = session.exec(
                select(Users).where(Users.supabase_user_id == user_id)
            ).first()
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Business logic: Find user's participation in the league
            user_league_link = session.exec(
                select(UserLeagueLink).where(
                    (UserLeagueLink.user_id == user.id) &
                    (UserLeagueLink.league_id == league_id) &
                    (UserLeagueLink.is_active == True)
                )
            ).first()
            
            if not user_league_link:
                raise HTTPException(
                    status_code=404, 
                    detail="User is not a participant of this league"
                )
            
            # Business logic: Check if user is admin
            if user_league_link.is_admin:
                # Check if there are other participants
                other_participants = session.exec(
                    select(UserLeagueLink).where(
                        (UserLeagueLink.league_id == league_id) &
                        (UserLeagueLink.user_id != user.id) &
                        (UserLeagueLink.is_active == True)
                    )
                ).all()
                
                if other_participants:
                    raise HTTPException(
                        status_code=400, 
                        detail="Admin cannot leave league with other participants. Transfer admin rights first."
                    )
            
            # Remove user from league
            user_league_link.is_active = False
            session.add(user_league_link)
            session.commit()
            
            return {"message": "Successfully left the league"}
            
        except HTTPException:
            raise
        except Exception as e:
            self.logger.error("Error leaving league: %s", e)
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_user_leagues(self, user_id: str, session: Session) -> List[LeagueResponse]:
        """
        Get all leagues where the user is a participant
        Business logic for user's league membership
        
        Args:
            user_id: Supabase user ID
            session: Database session
            
        Returns:
            List of user's leagues
            
        Raises:
            HTTPException: If errors occur
        """
        try:
            # Business logic: Get user by Supabase ID
            user = session.exec(
                select(Users).where(Users.supabase_user_id == user_id)
            ).first()
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Get user's leagues
            user_leagues_query = session.exec(
                select(Leagues)
                .join(UserLeagueLink, UserLeagueLink.league_id == Leagues.id)
                .where(
                    (UserLeagueLink.user_id == user.id) &
                    (UserLeagueLink.is_active == True) &
                    (Leagues.is_active == True)
                )
            ).all()
            
            leagues = []
            for league in user_leagues_query:
                # Count participants for each league
                participants = session.exec(
                    select(UserLeagueLink).where(
                        (UserLeagueLink.league_id == league.id) &
                        (UserLeagueLink.is_active == True)
                    )
                ).all()
                participant_count = len(participants)
                
                leagues.append(LeagueResponse(
                    id=league.id,
                    name=league.name,
                    description=league.description,
                    admin_user_id=league.admin_user_id,
                    is_active=league.is_active,
                    join_code=league.join_code,
                    current_participants=participant_count,
                    created_at=league.created_at
                ))
            
            return leagues
            
        except HTTPException:
            raise
        except Exception as e:
            self.logger.error("Error fetching user leagues: %s", e)
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def join_league(self, league_join: LeagueJoin, user_id: str, session: Session) -> Dict[str, str]:
        """
        Join a league using join code
        Business logic for league joining
        
        Args:
            league_join: LeagueJoin object with join code
            user_id: Supabase user ID joining the league
            session: Database session
            
        Returns:
            Success message
            
        Raises:
            HTTPException: If errors occur
        """
        try:
            # Business logic: Get user by Supabase ID
            user = session.exec(
                select(Users).where(Users.supabase_user_id == user_id)
            ).first()
            
            if not user:
                raise HTTPException(status_code=404, detail="User not found")
            
            # Business logic: Find league by join code
            league = session.exec(
                select(Leagues).where(
                    (Leagues.join_code == league_join.join_code) &
                    (Leagues.is_active == True)
                )
            ).first()
            
            if not league:
                raise HTTPException(status_code=404, detail="League not found or inactive")
            
            # Business logic: Check if user is already a participant
            existing_link = session.exec(
                select(UserLeagueLink).where(
                    (UserLeagueLink.user_id == user.id) &
                    (UserLeagueLink.league_id == league.id) &
                    (UserLeagueLink.is_active == True)
                )
            ).first()
            
            if existing_link:
                raise HTTPException(
                    status_code=400, 
                    detail="User is already a participant of this league"
                )
            
            # Add user to league
            league_link = UserLeagueLink(
                user_id=user.id,
                league_id=league.id,
                is_admin=False,
                is_active=True
            )
            
            session.add(league_link)
            session.commit()
            
            return {"message": f"Successfully joined league: {league.name}"}
            
        except HTTPException:
            raise
        except Exception as e:
            self.logger.error("Error joining league: %s", e)
            raise HTTPException(status_code=500, detail="Internal server error")
    
    def get_league_participants(self, league_id: int, session: Session) -> Dict[str, Any]:
        """
        Get all participants of a specific league
        Business logic for league member management
        
        Args:
            league_id: League ID
            session: Database session
            
        Returns:
            League participants data
            
        Raises:
            HTTPException: If errors occur
        """
        try:
            # Business logic: Get league details
            league = session.exec(
                select(Leagues).where(Leagues.id == league_id)
            ).first()
            
            if not league:
                raise HTTPException(status_code=404, detail="League not found")
            
            # Get participants with user details
            participants = session.exec(
                select(Users, UserLeagueLink.is_admin)
                .join(UserLeagueLink, UserLeagueLink.user_id == Users.id)
                .where(
                    (UserLeagueLink.league_id == league_id) &
                    (UserLeagueLink.is_active == True)
                )
            ).all()
            
            participant_list = []
            for user, is_admin in participants:
                participant_list.append({
                    "id": user.id,
                    "user_name": user.user_name,
                    "email": user.email,
                    "is_admin": is_admin,
                    "joined_at": user.created_at
                })
            
            return {
                "league_id": league_id,
                "league_name": league.name,
                "participants": participant_list,
                "total_participants": len(participant_list)
            }
            
        except HTTPException:
            raise
        except Exception as e:
            self.logger.error("Error fetching league participants: %s", e)
            raise HTTPException(status_code=500, detail="Internal server error")