"""In this module the api exposes the endpoints"""
import logging
from sqlmodel import select, Session
import fastf1 as ff1
from fastapi.middleware.cors import CORSMiddleware
from fastapi import HTTPException
from f1_api.season.utils.driver_calc import get_database_data, get_driver_stats, get_drivers_mapped
from .config.sql_init import engine
from .season.update_db import update_db
from .app import app
from .models.f1_models import Teams
from .models.app_models import UserTeamsCreate, Users, UserCreate, UserResponse, UserTeams

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # Agregar puerto 5174 también
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ff1.Cache.enable_cache(r'C:/Users/Marc/Documents/ITA/Sprint 8/f1_api/ff1_cache')

@app.post("/season/")
async def update_season():
    """
    This endpoint posts all data for the current season into the DB
    """
    await update_db(engine)
    return {"status": "updated"}

@app.get("/teams/")
async def get_teams():
    """
    This endpoint gets all of the teams for the current season from the DB
    """
    try:
        with Session(engine) as session:
            teams = session.exec(select(Teams)).all()
            teams_mapped = [
                {**team.model_dump(), "points": 0} 
                for team in teams
            ]
            
            return teams_mapped
    except Exception as e:
        logging.warning(f"/teams/ execution interrupted by the following exception: {e}")
        return []

@app.get("/drivers/")
async def get_drivers():
    """
    Returns all drivers sorted by championship points up to the last round
    """
    try:
        with Session(engine) as session:
            database_data = get_database_data(session)
            max_round = database_data["max_round"]
            sprint_rounds = database_data["sprint_rounds"]
            results = database_data["results"]
            all_results = database_data["all_results"]
            db_drivers = database_data["drivers"]

            points_map = {r.driver_id: r.total_points for r in results}

            available_points = 25 * max_round + len(sprint_rounds) * 8

            stats = get_driver_stats(all_results)
            
            drivers_sorted = sorted(
                db_drivers,
                key=lambda d: points_map.get(d.id, 0),
                reverse=True
            )

            drivers = get_drivers_mapped(max_round,stats,points_map,available_points,drivers_sorted,session)

            return drivers
    except Exception as e:
        logging.warning(f"/drivers/ execution interrupted by the following exception: {e}")
        return []

@app.post("/users/", response_model=UserResponse)
async def create_user(user: UserCreate):
    """
    Create a new user with Supabase integration
    """
    try:
        with Session(engine) as session:
            existing_user = session.exec(
                select(Users).where(
                    (Users.user_name == user.user_name) | 
                    (Users.email == user.email) |
                    (Users.supabase_user_id == user.supabase_user_id)
                )
            ).first()
            
            if existing_user:
                raise HTTPException(
                    status_code=400,
                    detail="Username, email, or Supabase user already registered"
                )
            
            new_user = Users(
                user_name=user.user_name,
                email=user.email,
                supabase_user_id=user.supabase_user_id,
                is_verified=True
            )
            
            session.add(new_user)
            session.commit()
            session.refresh(new_user)
            
            return UserResponse(
                id=new_user.id,
                user_name=new_user.user_name,
                email=new_user.email,
                is_verified=new_user.is_verified,
                created_at=new_user.created_at
            )
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Error creating user: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

@app.post("/user-team/")
async def create_user_team(user_team: UserTeamsCreate):
    """
    Post a new user team into the database
    """

    try:
        with Session(engine) as session:
            session.add(UserTeams(
                user_id=user_team.user_id,
                league_id=None,
                team_name=None,
                driver_1_id=user_team.driver_1_id,
                driver_2_id=user_team.driver_2_id,
                driver_3_id=user_team.driver_3_id,
                constructor_id=user_team.constructor_id,
                total_points=0,
                is_active=True,
            ))
            session.commit()
    except Exception as e:
        logging.error(f"Error creating user team: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")
    
@app.get("/users/by-id/{supabase_user_id}")
async def get_user_by_id(supabase_user_id: str):
    with Session(engine) as session:
        user = session.exec(
            select(Users).where(Users.supabase_user_id == supabase_user_id)
        ).first()

        if not user:
            raise HTTPException(status_code=400, detail="User not found")
        
        return { "data": user }