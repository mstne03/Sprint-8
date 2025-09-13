from sqlalchemy import Column, ForeignKeyConstraint, UniqueConstraint, DateTime, Integer
from sqlmodel import Field, SQLModel
from datetime import datetime

class Seasons(SQLModel, table=True):
    year: int = Field(primary_key=True)

class Events(SQLModel, table=True):
    round_number: int = Field(primary_key=True)
    season_id: int = Field(foreign_key="seasons.year", primary_key=True)
    event_name: str
    event_type: str
    event_country: str
    date_start: datetime = Field(sa_column=Column(DateTime))

    __table_args__ = (
        UniqueConstraint('season_id', 'event_name'),
    )

class Sessions(SQLModel, table=True):
    round_number: int = Field(primary_key=True)
    season_id: int = Field(primary_key=True)
    session_number: int = Field(primary_key=True)
    session_type: str | None

    __table_args__ = (
        ForeignKeyConstraint(
            ['round_number', 'season_id'],
            ['events.round_number', 'events.season_id']
        ),
    )

class Teams(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    team_name: str

class Drivers(SQLModel, table=True):
    id: int = Field(default=None, primary_key=True)
    full_name: str
    acronym: str
    country_code: str | None

class DriverTeamLink(SQLModel, table=True):
    driver_id: int = Field(foreign_key="drivers.id",primary_key=True)
    team_id: int = Field(foreign_key="teams.id",primary_key=True)
    season_id: int = Field(foreign_key="seasons.year",primary_key=True)
    round_number: int = Field(foreign_key="events.round_number",primary_key=True)

class EventSessionLink(SQLModel, table=True):
    round_number: int = Field(primary_key=True)
    season_id: int = Field(primary_key=True)
    session_number: int = Field(primary_key=True)

    __table_args__ = (
        ForeignKeyConstraint(
            ['round_number', 'season_id'],
            ['events.round_number', 'events.season_id']
        ),
        ForeignKeyConstraint(
            ['round_number', 'season_id', 'session_number'],
            ['sessions.round_number', 'sessions.season_id', 'sessions.session_number']
        ),
    )

class SessionDriverLink(SQLModel, table=True):
    event_id: int = Field(primary_key=True)
    season_id: int = Field(primary_key=True)
    session_number: int = Field(primary_key=True)
    driver_id: int = Field(foreign_key="drivers.id", primary_key=True)

    __table_args__ = (
        ForeignKeyConstraint(
            ['event_id', 'season_id', 'session_number'],
            ['sessions.round_number', 'sessions.season_id', 'sessions.session_number']
        ),
    )

class SessionTeamLink(SQLModel, table=True):
    event_id: int = Field(primary_key=True)
    season_id: int = Field(primary_key=True)
    session_number: int = Field(primary_key=True)
    team_id: int = Field(foreign_key="teams.id", primary_key=True)

    __table_args__ = (
        ForeignKeyConstraint(
            ['event_id', 'season_id', 'session_number'],
            ['sessions.round_number', 'sessions.season_id', 'sessions.session_number']
        ),
    )

class DriverRaceResults(SQLModel, table=True):
    season_id: int = Field(foreign_key="seasons.year", primary_key=True)
    driver_id: int = Field(foreign_key="drivers.id", primary_key=True)
    position: int
    points: int
    finish_time: float
    f_lap: bool
    dnf: bool

class TeamRaceResults(SQLModel, table=True):
    season_id: int = Field(foreign_key="seasons.year", primary_key=True)
    session_id: int = Field(foreign_key="sessions.round_number", primary_key=True)
    team_id: int = Field(foreign_key="teams.id", primary_key=True)
    points: int

class DriverQualiResults(SQLModel, table=True):
    season_id: int = Field(foreign_key="seasons.year", primary_key=True)
    session_id: int = Field(foreign_key="sessions.round_number", primary_key=True)
    driver_id: int = Field(foreign_key="drivers.id", primary_key=True)
    position: int
    quali_time: float
    q1_ko: bool
    q2_ko: bool

class DriverChampionshipStandings(SQLModel, table=True):
    season_id: int = Field(foreign_key="seasons.year", primary_key=True)
    round_number: int = Field(foreign_key="events.round_number", primary_key=True)
    driver_id: int = Field(foreign_key="drivers.id", primary_key=True)
    points: int

class TeamChampionshipStandings(SQLModel, table=True):
    season_id: int = Field(foreign_key="seasons.year", primary_key=True)
    round_number: int = Field(foreign_key="events.round_number", primary_key=True)
    team_id: int = Field(foreign_key="teams.id", primary_key=True)
    points: int
