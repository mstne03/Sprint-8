"""Teams service module for teams-related operations"""
import logging
from sqlmodel import Session, select, func
from f1_api.models.f1_models import DriverTeamLink, SessionResult, Teams


def get_teams_service(session: Session) -> list:
    """
    Get all teams for the current season from the DB with accumulated points
    
    Args:
        session: Database session
        
    Returns:
        list: Teams with calculated points
    """
    try:
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
        
        for team_id, driver_id, _, round_points in team_points_data:
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
        
    except Exception as e:
        logging.warning("Teams service execution interrupted by the following exception: %s", e)
        return []