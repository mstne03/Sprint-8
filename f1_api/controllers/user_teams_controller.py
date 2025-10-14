"""User teams controller module for team-related operations"""
import logging
from datetime import datetime
from sqlmodel import select, Session
from fastapi import HTTPException
from ..models.app_models import (
    Users, UserTeams, UserLeagueLink, UserTeamUpdate, UserTeamResponse
)


def create_or_update_user_team_service(
    league_id: int, 
    team_data: UserTeamUpdate, 
    user_id: str, 
    session: Session
) -> UserTeams:
    """
    Create or update a user's team in a specific league
    
    Args:
        league_id: ID of the league for the team
        team_data: UserTeamUpdate object with team data
        user_id: Supabase user ID of the team owner
        session: Database session
        
    Returns:
        UserTeams: Created or updated team object
        
    Raises:
        HTTPException: If user not found, not a member, or drivers not unique
    """
    try:
        # Verify user exists
        user = session.exec(
            select(Users).where(Users.supabase_user_id == user_id)
        ).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Verify user is a member of this league
        membership = session.exec(
            select(UserLeagueLink).where(
                UserLeagueLink.league_id == league_id,
                UserLeagueLink.user_id == user.id,
                UserLeagueLink.is_active == True
            )
        ).first()
        
        if not membership:
            raise HTTPException(status_code=403, detail="Access denied: You are not a member of this league")
        
        # Validate drivers are unique
        driver_ids = [team_data.driver_1_id, team_data.driver_2_id, team_data.driver_3_id]
        if len(set(driver_ids)) != 3:
            raise HTTPException(status_code=400, detail="All drivers must be unique")
        
        # Check if user already has a team in this league
        existing_team = session.exec(
            select(UserTeams).where(
                UserTeams.user_id == user.id,
                UserTeams.league_id == league_id,
                UserTeams.is_active == True
            )
        ).first()
        
        if existing_team:
            # Update existing team
            existing_team.team_name = team_data.team_name
            existing_team.driver_1_id = team_data.driver_1_id
            existing_team.driver_2_id = team_data.driver_2_id
            existing_team.driver_3_id = team_data.driver_3_id
            existing_team.constructor_id = team_data.constructor_id
            existing_team.updated_at = datetime.now()
            
            session.add(existing_team)
            session.commit()
            session.refresh(existing_team)
            
            return existing_team
        else:
            # Create new team
            new_team = UserTeams(
                user_id=user.id,
                league_id=league_id,
                team_name=team_data.team_name,
                driver_1_id=team_data.driver_1_id,
                driver_2_id=team_data.driver_2_id,
                driver_3_id=team_data.driver_3_id,
                constructor_id=team_data.constructor_id,
                total_points=0,
                budget_remaining=100_000_000,
                is_active=True
            )
            
            session.add(new_team)
            session.commit()
            session.refresh(new_team)
            
            return new_team
            
    except HTTPException:
        raise
    except Exception as e:
        logging.error("Error creating/updating user team: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")


def get_my_team_service(league_id: int, user_id: str, session: Session) -> UserTeams | None:
    """
    Get the current user's team in a specific league
    
    Args:
        league_id: ID of the league to get team from
        user_id: Supabase user ID of the team owner
        session: Database session
        
    Returns:
        UserTeams | None: User's team in the league or None if no team exists
        
    Raises:
        HTTPException: If user not found or not a member of the league
    """
    try:
        # Verify user exists
        user = session.exec(
            select(Users).where(Users.supabase_user_id == user_id)
        ).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Verify user is a member of this league
        membership = session.exec(
            select(UserLeagueLink).where(
                UserLeagueLink.league_id == league_id,
                UserLeagueLink.user_id == user.id,
                UserLeagueLink.is_active == True
            )
        ).first()
        
        if not membership:
            raise HTTPException(status_code=403, detail="Access denied: You are not a member of this league")
        
        # Get user's team in this league
        team = session.exec(
            select(UserTeams).where(
                UserTeams.user_id == user.id,
                UserTeams.league_id == league_id,
                UserTeams.is_active == True
            )
        ).first()
        
        return team
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error("Error fetching user team: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")


def get_my_teams_service(user_id: str, session: Session) -> list[dict]:
    """
    Get all teams belonging to the current user across all leagues
    
    Args:
        user_id: Supabase user ID of the team owner
        session: Database session
        
    Returns:
        list[dict]: List of team data with detailed information
        
    Raises:
        HTTPException: If user not found or other errors occur
    """
    try:
        # Import here to avoid circular imports
        from ..models.f1_schemas import Teams, Drivers
        from ..models.app_models import Leagues
        
        # Verify user exists
        user = session.exec(
            select(Users).where(Users.supabase_user_id == user_id)
        ).first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get all user's teams
        user_teams = session.exec(
            select(UserTeams).where(
                UserTeams.user_id == user.id,
                UserTeams.is_active == True
            )
        ).all()
        
        # Format the response with basic information
        teams_data = []
        for team in user_teams:
            # Get league name
            league = session.exec(
                select(Leagues).where(Leagues.id == team.league_id)
            ).first()
            
            # Get drivers and constructor info
            driver1 = session.exec(
                select(Drivers).where(Drivers.id == team.driver_1_id)
            ).first()
            driver2 = session.exec(
                select(Drivers).where(Drivers.id == team.driver_2_id)
            ).first()
            driver3 = session.exec(
                select(Drivers).where(Drivers.id == team.driver_3_id)
            ).first()
            constructor = session.exec(
                select(Teams).where(Teams.id == team.constructor_id)
            ).first()
            
            team_data = {
                "id": team.id,
                "team_name": team.team_name,
                "league_id": team.league_id,
                "league_name": league.name if league else "Unknown League",
                "total_points": team.total_points,
                "budget_remaining": team.budget_remaining,
                "created_at": team.created_at,
                "updated_at": team.updated_at,
                "drivers": [
                    {
                        "id": driver1.id if driver1 else None,
                        "name": driver1.full_name if driver1 else "Unknown Driver",
                        "headshot": driver1.headshot_url if driver1 else None
                    },
                    {
                        "id": driver2.id if driver2 else None,
                        "name": driver2.full_name if driver2 else "Unknown Driver",
                        "headshot": driver2.headshot_url if driver2 else None
                    },
                    {
                        "id": driver3.id if driver3 else None,
                        "name": driver3.full_name if driver3 else "Unknown Driver",
                        "headshot": driver3.headshot_url if driver3 else None
                    }
                ],
                "constructor": {
                    "id": constructor.id if constructor else None,
                    "name": constructor.team_name if constructor else "Unknown Constructor",
                    "logo": f"/teams/{constructor.team_name.lower().replace(' ', '')}.svg" if constructor else None
                }
            }
            teams_data.append(team_data)
        
        return teams_data
        
    except HTTPException:
        raise
    except Exception as e:
        logging.error("Error fetching user teams: %s", e)
        raise HTTPException(status_code=500, detail="Internal server error")