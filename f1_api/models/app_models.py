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
