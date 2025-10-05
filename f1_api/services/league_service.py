"""League service module for league-related operations"""
import logging
import secrets
import string
from sqlmodel import select, Session
from fastapi import HTTPException
from ..models.app_models import (
    Users, Leagues, LeagueCreate, LeagueResponse, UserLeagueLink
)


def generate_join_code(length: int = 8) -> str:
    """Generate a unique join code for leagues"""
    characters = string.ascii_uppercase + string.digits
    return ''.join(secrets.choice(characters) for _ in range(length))


def create_league_service(league: LeagueCreate, admin_user_id: str, session: Session) -> LeagueResponse:
    """
    Create a new league and automatically add the creator as admin
    
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
        # Verify user exists by supabase_user_id
        user = session.exec(
            select(Users).where(Users.supabase_user_id == admin_user_id)
        ).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Generate unique join code
        join_code = generate_join_code()
        while session.exec(
            select(Leagues).where(Leagues.join_code == join_code)
        ).first():
            join_code = generate_join_code()  # Regenerate if exists
        
        # Create league using the numeric user id
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
        
        # Add creator as admin member using numeric user id
        league_link = UserLeagueLink(
            user_id=user.id,
            league_id=new_league.id,
            is_admin=True,
            is_active=True
        )
        
        session.add(league_link)
        session.commit()
        
        # Return league with current_participants = 1
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
        logging.error("Error creating league: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")


def get_league_by_id_service(league_id: int, user_id: str, session: Session) -> LeagueResponse:
    """
    Get details of a specific league by ID - only for league participants
    
    Args:
        league_id: ID of the league to retrieve
        user_id: Supabase user ID of the requesting user
        session: Database session
        
    Returns:
        LeagueResponse: League data with participant count
        
    Raises:
        HTTPException: If user not found, league not found, or access denied
    """
    try:
        # Verify user exists by supabase_user_id
        user = session.exec(
            select(Users).where(Users.supabase_user_id == user_id)
        ).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get league by ID
        league = session.exec(
            select(Leagues).where(Leagues.id == league_id)
        ).first()
        
        if not league:
            raise HTTPException(status_code=404, detail="League not found")
        
        # Verify user is a participant in this league
        user_membership = session.exec(
            select(UserLeagueLink).where(
                UserLeagueLink.league_id == league_id,
                UserLeagueLink.user_id == user.id,
                UserLeagueLink.is_active == True
            )
        ).first()
        
        if not user_membership:
            raise HTTPException(status_code=403, detail="Access denied: You are not a member of this league")
        
        # Count current participants
        participants_count = session.exec(
            select(UserLeagueLink).where(
                UserLeagueLink.league_id == league_id,
                UserLeagueLink.is_active == True
            )
        ).fetchall()
        
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
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error("Error fetching league: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")


def leave_league_service(league_id: int, user_id: str, session: Session) -> dict:
    """
    Remove user from a league (leave league) and delete their team
    
    Args:
        league_id: ID of the league to leave
        user_id: Supabase user ID of the user leaving
        session: Database session
        
    Returns:
        dict: Success message with league information
        
    Raises:
        HTTPException: If user not found, league not found, or user not a member
    """
    try:
        # Import UserTeams here to avoid circular imports
        from ..models.app_models import UserTeams
        
        # Verify user exists by supabase_user_id
        user = session.exec(
            select(Users).where(Users.supabase_user_id == user_id)
        ).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get league by ID
        league = session.exec(
            select(Leagues).where(Leagues.id == league_id)
        ).first()
        
        if not league:
            raise HTTPException(status_code=404, detail="League not found")
        
        # Verify user is a participant in this league
        user_membership = session.exec(
            select(UserLeagueLink).where(
                UserLeagueLink.league_id == league_id,
                UserLeagueLink.user_id == user.id,
                UserLeagueLink.is_active == True
            )
        ).first()
        
        if not user_membership:
            raise HTTPException(status_code=404, detail="User is not a member of this league")
        
        # Deactivate membership
        user_membership.is_active = False
        session.add(user_membership)
        
        # Hard delete user's team in this league
        user_team = session.exec(
            select(UserTeams).where(
                UserTeams.user_id == user.id,
                UserTeams.league_id == league_id,
                UserTeams.is_active == True
            )
        ).first()
        
        if user_team:
            session.delete(user_team)
            logging.info("Deleted team '%s' for user %s in league %s", 
                        user_team.team_name, user.id, league_id)
        
        session.commit()
        
        return {
            "message": f"Successfully left league '{league.name}'", 
            "league_id": league_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error("Error leaving league: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")


def get_user_leagues_service(user_id: str, session: Session) -> list[LeagueResponse]:
    """
    Get all leagues where the user is a participant
    
    Args:
        user_id: Supabase user ID of the requesting user
        session: Database session
        
    Returns:
        list[LeagueResponse]: List of leagues where user is a participant
        
    Raises:
        HTTPException: If user not found or other errors occur
    """
    try:
        # Verify user exists by supabase_user_id
        user = session.exec(
            select(Users).where(Users.supabase_user_id == user_id)
        ).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get leagues where user is a participant using the numeric user id
        leagues_query = (
            select(Leagues, UserLeagueLink)
            .join(UserLeagueLink, Leagues.id == UserLeagueLink.league_id)
            .where(
                UserLeagueLink.user_id == user.id,
                UserLeagueLink.is_active == True,
                Leagues.is_active == True
            )
        )
        
        leagues_data = session.exec(leagues_query).all()
        
        # Build response with current participants count
        response_leagues = []
        for league, _ in leagues_data:
            # Count current participants
            participants_count = session.exec(
                select(UserLeagueLink)
                .where(
                    UserLeagueLink.league_id == league.id,
                    UserLeagueLink.is_active == True
                )
            ).fetchall()
            
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
        
        return response_leagues
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error("Error fetching user leagues: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")


def join_league_service(league_join, user_id: str, session: Session) -> dict:
    """
    Join a league using join code
    
    Args:
        league_join: LeagueJoin object with join code
        user_id: Supabase user ID of the user joining
        session: Database session
        
    Returns:
        dict: Success message with league information
        
    Raises:
        HTTPException: If user not found, league not found, or user already a member
    """
    try:
        # Verify user exists by supabase_user_id
        user = session.exec(
            select(Users).where(Users.supabase_user_id == user_id)
        ).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Find league by join code
        league = session.exec(
            select(Leagues).where(
                Leagues.join_code == league_join.join_code,
                Leagues.is_active == True
            )
        ).first()
        
        if not league:
            raise HTTPException(status_code=404, detail="League not found or inactive")
        
        # Check if user is already a member
        existing_membership = session.exec(
            select(UserLeagueLink).where(
                UserLeagueLink.user_id == user.id,
                UserLeagueLink.league_id == league.id
            )
        ).first()
        
        if existing_membership:
            if existing_membership.is_active:
                raise HTTPException(status_code=409, detail="User is already a member of this league")
            else:
                # Reactivate membership
                existing_membership.is_active = True
                session.add(existing_membership)
                session.commit()
                return {"message": "Successfully rejoined league", "league_id": league.id}
        
        # Add user to league using the numeric user id
        new_membership = UserLeagueLink(
            user_id=user.id,
            league_id=league.id,
            is_admin=False,
            is_active=True
        )
        
        session.add(new_membership)
        session.commit()
        
        return {"message": "Successfully joined league", "league_id": league.id}
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error("Error joining league: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")


def get_league_participants_service(league_id: int, session: Session) -> dict:
    """
    Get all participants of a specific league
    
    Args:
        league_id: ID of the league to get participants for
        session: Database session
        
    Returns:
        dict: League information with participants list
        
    Raises:
        HTTPException: If league not found or other errors occur
    """
    try:
        # Verify league exists
        league = session.exec(
            select(Leagues).where(
                Leagues.id == league_id,
                Leagues.is_active == True
            )
        ).first()
        
        if not league:
            raise HTTPException(status_code=404, detail="League not found")
        
        # Get participants with user details
        participants_query = (
            select(Users, UserLeagueLink)
            .join(UserLeagueLink, Users.id == UserLeagueLink.user_id)
            .where(
                UserLeagueLink.league_id == league_id,
                UserLeagueLink.is_active == True
            )
        )
        
        participants_data = session.exec(participants_query).all()
        
        # Build response
        participants = []
        for user, link in participants_data:
            participants.append({
                "user_id": user.id,
                "user_name": user.user_name,
                "email": user.email,
                "is_admin": link.is_admin,
                "joined_at": link.joined_at
            })
        
        return {
            "league_id": league_id,
            "league_name": league.name,
            "participants": participants,
            "total_participants": len(participants)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error("Error fetching league participants: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")