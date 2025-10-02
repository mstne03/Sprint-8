from pydantic import BaseModel
from sqlalchemy import Column, ForeignKeyConstraint, UniqueConstraint, DateTime, String
from sqlmodel import Field, SQLModel
from datetime import datetime

class Leagues(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    name: str
    description: str | None = None
    admin_user_id: int = Field(foreign_key="users.id")
    is_active: bool = Field(default=True)
    max_participants: int = Field(default=10)
    join_code: str = Field(unique=True, index=True)
    season_year: int
    created_at: datetime = Field(default_factory=datetime.now)

class UserTeams(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id")
    league_id: int = Field(default=None,foreign_key="leagues.id")
    team_name: str | None
    driver_1_id: int = Field(foreign_key="drivers.id")
    driver_2_id: int = Field(foreign_key="drivers.id")
    driver_3_id: int = Field(foreign_key="drivers.id")
    constructor_id: int = Field(foreign_key="teams.id")
    total_points: int = Field(default=0)
    is_active: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)

class UserTeamsCreate(BaseModel):
    user_id: int
    league_id: int | None
    team_name: str | None
    driver_1_id: int
    driver_2_id: int
    driver_3_id: int
    constructor_id: int

class Users(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    user_name: str = Field(unique=True, index=True)
    email: str = Field(unique=True, index=True)
    supabase_user_id: str = Field(unique=True, index=True)
    is_verified: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.now)

class UserLeagueLink(SQLModel, table=True):
    user_id: int = Field(foreign_key="users.id", primary_key=True)
    league_id: int = Field(foreign_key="leagues.id", primary_key=True)
    is_admin: bool = Field(default=False)
    is_active: bool = Field(default=True)
    joined_at: datetime = Field(default_factory=datetime.now)

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
