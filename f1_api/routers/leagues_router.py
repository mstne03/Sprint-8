"""League-related routes"""
from typing import List
from fastapi import APIRouter, Depends
from sqlmodel import Session
from f1_api.controllers.league_controller import LeagueController
from f1_api.controllers.user_teams_controller_new import UserTeamsController
from f1_api.controllers.driver_ownership_controller import DriverOwnershipController
from f1_api.controllers.market_controller import MarketController
from f1_api.dependencies import get_db_session
from f1_api.models.app_models import (
    LeagueCreate, LeagueResponse, LeagueJoin, UserTeamUpdate, UserTeamResponse,
    DriverOwnership
)
from pydantic import BaseModel

# Market request models
class BuyDriverRequest(BaseModel):
    buyer_user_id: int
    
class BuyFromUserRequest(BaseModel):
    buyer_user_id: int
    seller_user_id: int
    
class SellDriverRequest(BaseModel):
    seller_user_id: int
    
class ListDriverRequest(BaseModel):
    owner_user_id: int
    asking_price: float | None = None
    
class UnlistDriverRequest(BaseModel):
    owner_user_id: int
    
class BuyoutClauseRequest(BaseModel):
    buyer_user_id: int
    victim_user_id: int

router = APIRouter(prefix="/leagues", tags=["leagues"])

@router.post("/", response_model=LeagueResponse)
def create_league(
    league: LeagueCreate,
    admin_user_id: str,
    session: Session = Depends(get_db_session)
):
    """Create a new league and automatically add the creator as admin"""
    with LeagueController(session) as controller:
        return controller.create_league(admin_user_id, league)


@router.get("/{league_id}", response_model=LeagueResponse)
def get_league_by_id(
    league_id: int,
    user_id: str,
    session: Session = Depends(get_db_session)
):
    """Get details of a specific league by ID - only for league participants"""
    with LeagueController(session) as controller:
        return controller.get_league_by_id(league_id, user_id)


@router.delete("/{league_id}/leave")
def leave_league(
    league_id: int,
    user_id: str,
    session: Session = Depends(get_db_session)
):
    """Remove user from a league (leave league)"""
    with LeagueController(session) as controller:
        return controller.leave_league(league_id, user_id)


@router.get("/user/{user_id}", response_model=List[LeagueResponse])
def get_user_leagues(
    user_id: str,
    session: Session = Depends(get_db_session)
):
    """Get all leagues where the user is a participant"""
    with LeagueController(session) as controller:
        return controller.get_user_leagues(user_id)


@router.post("/join/")
def join_league(
    league_join: LeagueJoin,
    user_id: str,
    session: Session = Depends(get_db_session)
):
    """Join a league using join code"""
    with LeagueController(session) as controller:
        return controller.join_league(league_join, user_id)


@router.get("/{league_id}/participants")
def get_league_participants(
    league_id: int,
    session: Session = Depends(get_db_session)
):
    """Get all participants of a specific league"""
    with LeagueController(session) as controller:
        return controller.get_league_participants(league_id)


@router.post("/{league_id}/teams", response_model=UserTeamResponse)
def create_or_update_user_team(
    league_id: int,
    team_data: UserTeamUpdate,
    user_id: str,
    session: Session = Depends(get_db_session)
):
    """Create or update a user's team in a specific league"""
    with UserTeamsController(session) as controller:
        return controller.create_or_update_team(league_id, team_data, user_id)


@router.get("/{league_id}/teams/me", response_model=UserTeamResponse | None)
def get_my_team(
    league_id: int,
    user_id: str,
    session: Session = Depends(get_db_session)
):
    """Get the current user's team in a specific league"""
    with UserTeamsController(session) as controller:
        return controller.get_my_team(league_id, user_id)


# Driver Ownership endpoints
@router.get("/{league_id}/driver-ownership", response_model=List[DriverOwnership])
def get_league_driver_ownership(
    league_id: int,
    session: Session = Depends(get_db_session)
):
    """Get all driver ownership records for a specific league"""
    with DriverOwnershipController(session) as controller:
        return controller.get_all_drivers_with_ownership(league_id)


@router.get("/{league_id}/drivers/free", response_model=List[DriverOwnership])
def get_free_drivers_ownership(
    league_id: int,
    session: Session = Depends(get_db_session)
):
    """Get all free agent drivers (no owner) in a league - ownership data only"""
    with DriverOwnershipController(session) as controller:
        return controller.get_free_drivers(league_id)


@router.get("/{league_id}/drivers/for-sale", response_model=List[DriverOwnership])
def get_drivers_for_sale_ownership(
    league_id: int,
    session: Session = Depends(get_db_session)
):
    """Get all drivers listed for sale in a league - ownership data only"""
    with DriverOwnershipController(session) as controller:
        return controller.get_drivers_for_sale(league_id)


@router.get("/{league_id}/users/{user_id}/drivers", response_model=List[DriverOwnership])
def get_user_drivers_ownership(
    league_id: int,
    user_id: int,
    session: Session = Depends(get_db_session)
):
    """Get all drivers owned by a specific user in a league - ownership data only"""
    with DriverOwnershipController(session) as controller:
        return controller.get_user_owned_drivers(user_id, league_id)


@router.get("/{league_id}/drivers/{driver_id}/ownership", response_model=DriverOwnership | None)
def get_driver_ownership_status(
    league_id: int,
    driver_id: int,
    session: Session = Depends(get_db_session)
):
    """Get ownership status of a specific driver in a league"""
    with DriverOwnershipController(session) as controller:
        return controller.get_driver_ownership_status(driver_id, league_id)


@router.post("/{league_id}/initialize-ownership")
def initialize_league_ownership(
    league_id: int,
    season_year: int = 2025,
    session: Session = Depends(get_db_session)
):
    """Initialize driver ownership for an existing league (for leagues created before ownership system)"""
    with DriverOwnershipController(session) as controller:
        count = controller.initialize_league_ownership(league_id, season_year)
        return {
            "success": True,
            "league_id": league_id,
            "drivers_initialized": count,
            "message": f"Successfully initialized {count} driver ownership records"
        }


@router.post("/{league_id}/initialize-user-team")
def initialize_user_team(
    league_id: int,
    user_id: int,
    session: Session = Depends(get_db_session)
):
    """
    Initialize a user's team when they join a league.
    Assigns 3 random Tier C (low) drivers and creates UserTeam with remaining budget.
    """
    with MarketController(session) as controller:
        result = controller.initialize_user_team_on_join(user_id, league_id)
        return {
            "success": True,
            **result
        }


# Market GET endpoints
@router.get("/{league_id}/market/free-drivers")
def get_free_drivers(
    league_id: int,
    session: Session = Depends(get_db_session)
):
    """Get all free agent drivers available in the market"""
    with MarketController(session) as controller:
        return controller.get_free_drivers(league_id)


@router.get("/{league_id}/market/for-sale")
def get_drivers_for_sale(
    league_id: int,
    session: Session = Depends(get_db_session)
):
    """Get all drivers listed for sale by other users"""
    with MarketController(session) as controller:
        return controller.get_drivers_for_sale(league_id)


@router.get("/{league_id}/market/user-drivers/{user_id}")
def get_user_drivers(
    league_id: int,
    user_id: int,
    session: Session = Depends(get_db_session)
):
    """Get all drivers owned by a specific user"""
    with MarketController(session) as controller:
        return controller.get_user_drivers(user_id, league_id)


# Market POST endpoints
@router.post("/{league_id}/market/buy-from-market/{driver_id}")
def buy_driver_from_market(
    league_id: int,
    driver_id: int,
    request: BuyDriverRequest,
    session: Session = Depends(get_db_session)
):
    """Buy a free agent driver from the market"""
    with MarketController(session) as controller:
        return controller.buy_driver_from_market(
            driver_id=driver_id,
            buyer_id=request.buyer_user_id,
            league_id=league_id
        )


@router.post("/{league_id}/market/buy-from-user/{driver_id}")
def buy_driver_from_user(
    league_id: int,
    driver_id: int,
    request: BuyFromUserRequest,
    session: Session = Depends(get_db_session)
):
    """Buy a driver listed for sale from another user"""
    with MarketController(session) as controller:
        return controller.buy_driver_from_user(
            driver_id=driver_id,
            buyer_id=request.buyer_user_id,
            seller_id=request.seller_user_id,
            league_id=league_id
        )


@router.post("/{league_id}/market/sell-to-market/{driver_id}")
def sell_driver_to_market(
    league_id: int,
    driver_id: int,
    request: SellDriverRequest,
    session: Session = Depends(get_db_session)
):
    """Quick sell a driver back to the market (80% refund)"""
    with MarketController(session) as controller:
        return controller.sell_driver_to_market(
            driver_id=driver_id,
            seller_id=request.seller_user_id,
            league_id=league_id
        )


@router.post("/{league_id}/market/list-for-sale/{driver_id}")
def list_driver_for_sale(
    league_id: int,
    driver_id: int,
    request: ListDriverRequest,
    session: Session = Depends(get_db_session)
):
    """List a driver for sale (must be in reserve slot)"""
    with MarketController(session) as controller:
        return controller.list_driver_for_sale(
            driver_id=driver_id,
            owner_id=request.owner_user_id,
            league_id=league_id,
            asking_price=request.asking_price
        )


@router.delete("/{league_id}/market/list-for-sale/{driver_id}")
def unlist_driver_from_sale(
    league_id: int,
    driver_id: int,
    request: UnlistDriverRequest,
    session: Session = Depends(get_db_session)
):
    """Remove a driver from sale listings"""
    with MarketController(session) as controller:
        return controller.unlist_driver_from_sale(
            driver_id=driver_id,
            owner_id=request.owner_user_id,
            league_id=league_id
        )


@router.post("/{league_id}/market/buyout-clause/{driver_id}")
def execute_buyout_clause(
    league_id: int,
    driver_id: int,
    request: BuyoutClauseRequest,
    session: Session = Depends(get_db_session)
):
    """Execute a buyout clause on another user's driver (130% price)"""
    with MarketController(session) as controller:
        return controller.execute_buyout_clause(
            driver_id=driver_id,
            buyer_id=request.buyer_user_id,
            victim_id=request.victim_user_id,
            league_id=league_id
        )
