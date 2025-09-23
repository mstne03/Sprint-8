"""In this module the api exposes the endpoints"""
import logging
from sqlmodel import select, Session
from .config.sql_init import engine
import fastf1 as ff1
from .season.update_db import update_db
from .app import app
from .models.f1_models import Drivers, Teams, SessionResult
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # o ["*"] para permitir todos los orígenes
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

            return teams
    except Exception as e:
        logging.warning(f"/teams/ execution interrupted by the following exception: {e}")
        return []

from sqlmodel import select, func

@app.get("/drivers/")
async def get_drivers():
    """
    Returns all drivers sorted by championship points up to the last round
    """
    try:
        with Session(engine) as session:
            max_round = session.exec(
                select(func.max(SessionResult.round_number))
            ).one()
            results = session.exec(
                select(
                    SessionResult.driver_id,
                    func.sum(SessionResult.points).label("total_points")
                )
                .where(SessionResult.round_number <= max_round)
                .group_by(SessionResult.driver_id)
            ).all()
            points_map = {r.driver_id: r.total_points for r in results}

            all_results = session.exec(
                select(SessionResult)
                .where(
                    (SessionResult.round_number <= max_round) &
                    ((SessionResult.session_number == 5) | (SessionResult.session_number == 3))
                )
            ).all()

            stats = {}

            for r in all_results:
                driver_id = r.driver_id
                if driver_id not in stats:
                    stats[driver_id] = {
                        "poles": 0,
                        "podiums": 0,
                        "fastest_laps": 0,
                        "victories": 0,
                        "sprint_podiums": 0,
                        "sprint_victories": 0,
                        "sprint_poles": 0,
                    }
                
                if r.session_number == 5:
                    if r.grid_position == 1:
                        stats[driver_id]["poles"] += 1
                    if r.position in ["1", "2", "3"]:
                        stats[driver_id]["podiums"] += 1
                    if r.position == "1":
                        stats[driver_id]["victories"] += 1
                    if r.fastest_lap == 1:
                        stats[driver_id]["fastest_laps"] += 1
                if r.session_number == 3:
                    if r.position in ["1", "2", "3"]:
                        stats[driver_id]["sprint_podiums"] += 1
                    if r.position == "1":
                        stats[driver_id]["sprint_victories"] += 1
                    if r.grid_position == 1:
                        stats[driver_id]["sprint_poles"] += 1
                        
                

            drivers = session.exec(select(Drivers)).all()
            drivers_sorted = sorted(
                drivers,
                key=lambda d: points_map.get(d.id, 0),
                reverse=True
            )

            drivers = []

            for d in drivers_sorted:
                driver_dict = d.model_dump()
                driver_dict["points"] = points_map.get(d.id, 0)
                driver_stats = stats.get(d.id, {})
                driver_dict["poles"] = driver_stats.get("poles", 0)
                driver_dict["podiums"] = driver_stats.get("podiums", 0)
                driver_dict["fastest_laps"] = driver_stats.get("fastest_laps", 0)
                driver_dict["victories"] = driver_stats.get("victories", 0)
                driver_dict["sprint_podiums"] = driver_stats.get("sprint_podiums", 0)
                driver_dict["sprint_victories"] = driver_stats.get("sprint_victories", 0)
                driver_dict["sprint_poles"] = driver_stats.get("sprint_poles", 0)
                drivers.append(driver_dict)

            return drivers
    except Exception as e:
        logging.warning(f"/drivers/ execution interrupted by the following exception: {e}")
        return []
