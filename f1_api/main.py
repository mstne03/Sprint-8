"""In this module the api exposes the endpoints"""
import logging
from sqlmodel import select, Session, func
from .config.sql_init import engine
import fastf1 as ff1
from .season.update_db import update_db
from .app import app
from .models.f1_models import Drivers, Teams, SessionResult, DriverTeamLink, Sessions
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
            
            sprint_rounds = session.exec(
                select(Sessions)
                .where((Sessions.session_type == "Sprint") and (Sessions.round_number <= max_round))
            ).all()

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
            available_points = 25 * max_round + len(sprint_rounds) * 8

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
                        "finish_positions": [],
                        "grid_positions": [],
                        "pole_victories": 0,
                        "overtakes": [],
                    }
                
                if r.session_number == 5:
                    if r.grid_position == 1:
                        stats[driver_id]["poles"] += 1
                        if r.position == "1":
                            stats[driver_id]["pole_victories"] += 1
                    if r.grid_position and isinstance(r.grid_position, int):
                        stats[driver_id]["grid_positions"].append(r.grid_position)
                    if r.position in ["1", "2", "3"]:
                        stats[driver_id]["podiums"] += 1
                    if r.position and r.position.isdigit():
                        stats[driver_id]["finish_positions"].append(int(r.position))
                    else:
                        stats[driver_id]["finish_positions"].append(20)
                    if r.position == "1":
                        stats[driver_id]["victories"] += 1
                    if r.fastest_lap == 1:
                        stats[driver_id]["fastest_laps"] += 1
                    if r.position and r.position.isdigit() and r.grid_position and isinstance(r.grid_position, int):
                        stats[driver_id]["overtakes"].append(int(r.position) - r.grid_position)
                    else:
                        stats[driver_id]["overtakes"].append(0)
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
                team_id = session.exec(
                    select(DriverTeamLink.team_id)
                    .where((DriverTeamLink.driver_id == d.id) & (DriverTeamLink.round_number == max_round))
                ).first()
                team_name = session.exec(
                    select(Teams.team_name)
                    .where(Teams.id == team_id)
                ).first() if team_id else None
                if team_id == None:
                    team_id = session.exec(
                        select(DriverTeamLink.team_id)
                        .where((DriverTeamLink.driver_id == d.id))
                    ).first()
                    team_name = session.exec(
                        select(Teams.team_name)
                        .where(Teams.id == team_id)
                    ).first()
                driver_dict["team_name"] = team_name
                driver_stats = stats.get(d.id, {})
                finishes = driver_stats.get("finish_positions", None)
                grids = driver_stats.get("grid_positions", None)
                pole_victories = driver_stats.get("pole_victories", None)
                poles = driver_stats.get("poles", 0)
                points = points_map.get(d.id, 0)
                podiums = driver_stats.get("podiums", 0)
                victories = driver_stats.get("victories", 0)
                overtakes = driver_stats.get("overtakes", 0)
                driver_dict["season_results"] = {
                    "points": points,
                    "poles": poles,
                    "podiums": podiums,
                    "fastest_laps": driver_stats.get("fastest_laps", 0),
                    "victories": victories,
                    "sprint_podiums": driver_stats.get("sprint_podiums", 0),
                    "sprint_victories": driver_stats.get("sprint_victories", 0),
                    "sprint_poles": driver_stats.get("sprint_poles", 0)
                }
                driver_dict["fantasy_stats"] = {
                    "avg_finish": round(sum(finishes) / len(finishes), 1) if finishes else 0,
                    "avg_grid_position": round(sum(grids) / len(grids), 1) if grids else 0,
                    "pole_win_conversion": round(((pole_victories * 100) / poles ), 1) if poles else 0,
                    "price": round(1000000 + (points * 1000) + (podiums * 5000) + (victories * 10000), 0),
                    "overtake_efficiency": round(sum(overtakes) / len(overtakes), 1) if overtakes else 0,
                    "available_points_percentatge": round(points * 100 / available_points, 1) if available_points > 0 else 0,
                }
                drivers.append(driver_dict)

            return drivers
    except Exception as e:
        logging.warning(f"/drivers/ execution interrupted by the following exception: {e}")
        return []
