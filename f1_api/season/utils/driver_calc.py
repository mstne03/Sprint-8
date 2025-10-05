"""
Drivers complex operations
"""
from sqlmodel import select, func
from f1_api.models.f1_models import DriverTeamLink, Sessions, SessionResult, Drivers, Teams

def get_database_data(session):
    """
    Communicates with supabase to get all necessary data
    """
    max_round = session.exec(
        select(func.max(SessionResult.round_number))
    ).one()

    sprint_rounds = session.exec(
        select(Sessions)
        .where((Sessions.session_type == "Sprint") & (Sessions.round_number <= max_round))
    ).all()

    results = session.exec(
        select(
            SessionResult.driver_id,
            func.sum(SessionResult.points).label("total_points")
        )
        .where(SessionResult.round_number <= max_round)
        .group_by(SessionResult.driver_id)
    ).all()

    all_results = session.exec(
        select(SessionResult)
        .where(
            (SessionResult.round_number <= max_round) &
            ((SessionResult.session_number == 5) | (SessionResult.session_number == 3))
        )
    ).all()

    drivers = session.exec(select(Drivers)).all()

    return {
        "max_round": max_round,
        "sprint_rounds": sprint_rounds, 
        "results": results, 
        "all_results": all_results,
        "drivers": drivers
    }

def get_driver_stats(all_results):
    """
    Maps stats for all drivers
    """
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
    return stats

def get_drivers_mapped(max_round,stats,points_map,available_points,drivers_sorted,session):
    """
    Maps drivers final results
    """
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
        if team_id is None:
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

def get_teams_mapped(session):
    """
    Maps teams with accumulated points from their drivers - OPTIMIZED VERSION
    """
    teams = []
    
    # Get all teams
    all_teams = session.exec(select(Teams)).all()
    
    # OPTIMIZACIÓN: Una sola query para obtener TODOS los datos necesarios
    # En lugar de hacer N queries individuales por cada driver-round
    team_points_data = session.exec(
        select(
            DriverTeamLink.team_id,
            DriverTeamLink.driver_id,
            DriverTeamLink.round_number,
            func.sum(SessionResult.points).label("round_points")
        )
        .join(SessionResult, 
              (SessionResult.driver_id == DriverTeamLink.driver_id) & 
              (SessionResult.round_number == DriverTeamLink.round_number))
        .group_by(
            DriverTeamLink.team_id,
            DriverTeamLink.driver_id, 
            DriverTeamLink.round_number
        )
    ).all()
    
    # Procesar datos en memoria (mucho más rápido que queries individuales)
    team_stats = {}
    
    for team_id, driver_id, round_number, round_points in team_points_data:
        if team_id not in team_stats:
            team_stats[team_id] = {
                "total_points": 0,
                "drivers": set()
            }
        
        team_stats[team_id]["total_points"] += round_points or 0
        team_stats[team_id]["drivers"].add(driver_id)
    
    # Construir resultado final
    for team in all_teams:
        team_dict = team.model_dump()
        stats = team_stats.get(team.id, {"total_points": 0, "drivers": set()})
        
        team_dict["season_results"] = {
            "points": stats["total_points"],
            "driver_count": len(stats["drivers"])
        }
        
        teams.append(team_dict)
    
    # Sort teams by points (highest to lowest)
    teams.sort(key=lambda team: team["season_results"]["points"], reverse=True)
    
    return teams
