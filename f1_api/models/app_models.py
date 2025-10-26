from pydantic import BaseModel, Field
from sqlalchemy import UniqueConstraint
from sqlmodel import SQLModel, Field as SQLField
from datetime import datetime

class Leagues(SQLModel, table=True):
    id: int = SQLField(default=None, primary_key=True)
    name: str
    description: str | None = None
    admin_user_id: int = SQLField(foreign_key="users.id")
    is_active: bool = SQLField(default=True)
    join_code: str = SQLField(unique=True, index=True)
    created_at: datetime = SQLField(default_factory=datetime.now)

class UserTeams(SQLModel, table=True):
    id: int = SQLField(default=None, primary_key=True)
    user_id: int = SQLField(foreign_key="users.id")
    league_id: int = SQLField(foreign_key="leagues.id")
    team_name: str
    driver_1_id: int = SQLField(foreign_key="drivers.id")
    driver_2_id: int = SQLField(foreign_key="drivers.id")
    driver_3_id: int = SQLField(foreign_key="drivers.id")
    reserve_driver_id: int | None = SQLField(default=None, foreign_key="drivers.id")
    constructor_id: int = SQLField(foreign_key="teams.id")
    total_points: int = SQLField(default=0)
    budget_remaining: int = SQLField(default=100_000_000)
    is_active: bool = SQLField(default=True)
    created_at: datetime = SQLField(default_factory=datetime.now)
    updated_at: datetime = SQLField(default_factory=datetime.now)

    __table_args__ = (
        UniqueConstraint('user_id', 'league_id', name='unique_user_league_team'),
    )

class UserTeamsCreate(BaseModel):
    user_id: int
    league_id: int
    team_name: str
    driver_1_id: int
    driver_2_id: int
    driver_3_id: int
    constructor_id: int

class UserTeamUpdate(BaseModel):
    team_name: str = Field(min_length=4, max_length=50)
    driver_1_id: int
    driver_2_id: int
    driver_3_id: int
    constructor_id: int

class UserTeamResponse(BaseModel):
    id: int
    user_id: int
    league_id: int
    team_name: str
    driver_1_id: int
    driver_2_id: int
    driver_3_id: int
    reserve_driver_id: int | None
    constructor_id: int
    total_points: int
    budget_remaining: int
    is_active: bool
    created_at: datetime
    updated_at: datetime

class Users(SQLModel, table=True):
    id: int = SQLField(default=None, primary_key=True)
    user_name: str = SQLField(unique=True, index=True)
    email: str = SQLField(unique=True, index=True)
    supabase_user_id: str = SQLField(unique=True, index=True)
    is_verified: bool = SQLField(default=False)
    created_at: datetime = SQLField(default_factory=datetime.now)

class UserLeagueLink(SQLModel, table=True):
    user_id: int = SQLField(foreign_key="users.id", primary_key=True)
    league_id: int = SQLField(foreign_key="leagues.id", primary_key=True)
    is_admin: bool = SQLField(default=False)
    is_active: bool = SQLField(default=True)
    joined_at: datetime = SQLField(default_factory=datetime.now)

class UserCreate(BaseModel):
    user_name: str
    email: str
    supabase_user_id: str

class UserResponse(BaseModel):
    id: int
    user_name: str
    email: str
    is_verified: bool
    created_at: datetime

# League Management Models
class LeagueCreate(BaseModel):
    name: str = Field(min_length=3, max_length=50)
    description: str | None = Field(default=None, max_length=200)

class LeagueResponse(BaseModel):
    id: int
    name: str
    description: str | None
    admin_user_id: int
    is_active: bool
    join_code: str
    current_participants: int
    created_at: datetime

class LeagueJoin(BaseModel):
    join_code: str = Field(min_length=6, max_length=10)

# Market Ownership Models
class DriverOwnership(SQLModel, table=True):
    driver_id: int = SQLField(foreign_key="drivers.id", primary_key=True)
    league_id: int = SQLField(foreign_key="leagues.id", primary_key=True)
    owner_id: int | None = SQLField(foreign_key="users.id", default=None)  # None = piloto libre
    is_listed_for_sale: bool = SQLField(default=False)
    acquisition_price: float  # Precio al que fue adquirido (NO cambiar cuando se lista)
    asking_price: float | None = SQLField(default=None)  # Precio de venta cuando está listado
    locked_until: datetime | None = SQLField(default=None)  # Fecha de desbloqueo
    created_at: datetime = SQLField(default_factory=datetime.now)
    updated_at: datetime = SQLField(default_factory=datetime.now)

    __table_args__ = (
        UniqueConstraint('driver_id', 'league_id', name='unique_driver_league_ownership'),
    )

class MarketTransactions(SQLModel, table=True):
    id: int = SQLField(default=None, primary_key=True)
    driver_id: int = SQLField(foreign_key="drivers.id")
    league_id: int = SQLField(foreign_key="leagues.id")
    seller_id: int | None = SQLField(foreign_key="users.id", default=None)  # None = compra del mercado libre
    buyer_id: int = SQLField(foreign_key="users.id")
    transaction_price: float
    transaction_type: str  # 'buy_from_market', 'buy_from_user', 'sell_to_market', 'buyout_clause', 'emergency_assignment'
    transaction_date: datetime = SQLField(default_factory=datetime.now)

class BuyoutClauseHistory(SQLModel, table=True):
    id: int = SQLField(default=None, primary_key=True)
    league_id: int = SQLField(foreign_key="leagues.id")
    buyer_id: int = SQLField(foreign_key="users.id")
    victim_id: int = SQLField(foreign_key="users.id")
    driver_id: int = SQLField(foreign_key="drivers.id")
    buyout_price: float
    buyout_date: datetime = SQLField(default_factory=datetime.now)
    season_year: int
