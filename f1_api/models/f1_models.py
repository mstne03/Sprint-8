from typing import Annotated
from sqlmodel import Field, Session, SQLModel, create_engine, select


class Drivers(SQLModel, table=True):
    full_name: str = Field(default=None, primary_key=True)
    acronym: str = Field(default=None, primary_key=True)
    team_name: str = Field(default=None, primary_key=True)
    country_code: str = Field(default=None, primary_key=True)
    driver_number: int = Field(default=None, primary_key=True)
    race_results: list[int] = Field(default=None, primary_key=True)
    championship: list[int] = Field(default=None, primary_key=True)

class Teams(SQLModel, table=True):
    year: int = Field(default=None, primary_key=True)
    team_name: str = Field(default=None, primary_key=True)
    drivers: list[Drivers] = Field(default=None, primary_key=True)
    race_results: list[int] = Field(default=None, primary_key=True)
    championship: list[int] = Field(default=None, primary_key=True)

class F1_Sessions(SQLModel, table=True):
    event_name: str = Field(default=None, primary_key=True)
    session_type: int = Field(default=None, primary_key=True)
    drivers: list[Drivers] = Field(default=None, primary_key=True)
    teams: list[Teams] = Field(default=None, primary_key=True)

class F1_Events(SQLModel, table=True):
    year: int = Field(default=None, primary_key=True)
    event_name: str = Field(default=None, primary_key=True)
    event_type: str = Field(default=None, primary_key=True)
    sessions: list[F1_Sessions] = Field(default=None, primary_key=True)
    teams: list[Teams] = Field(default=None, primary_key=True)

class Seasons(SQLModel, table=True):
    year: int = Field(default=None, primary_key=True)
    teams: list[Teams] = Field(default=None, primary_key=True)
    events: list[F1_Events] = Field(default=None, primary_key=True)
    sessions: list[F1_Sessions] = Field(default=None, primary_key=True)
