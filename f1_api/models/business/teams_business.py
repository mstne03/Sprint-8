"""Gets calculation results over teams DB data"""
from typing import Dict

from f1_api.models.f1_models import Teams

class TeamsBusinessLogic:
    """Encapsulates teams calculations"""
    @staticmethod
    def calculate_team_statistics(team_points_data: list) -> Dict[int, Dict]:
        """Calculate team statistics from raw data"""
        team_stats = {}

        for team_id, driver_id, round_number, round_points in team_points_data:
            if team_id not in team_stats:
                team_stats[team_id] = {
                    "total_points": 0,
                    "drivers": set()
                }
            
            team_stats[team_id]["total_points"] += round_points or 0
            team_stats[team_id]["drivers"].add(driver_id)
        
        return team_stats
    
    @staticmethod
    def build_teams_with_stats(teams: list[Teams], team_stats: Dict) -> list:
        """Establishes relationship between team raw data and statistics"""
        result = []

        for team in teams:
            team_dict = team.model_dump()
            stats = team_stats.get(team.id, {"total_points": 0, "drivers": set()})
            
            team_dict["season_results"] = {
                "points": stats["total_points"],
                "driver_count": len(stats["drivers"])
            }
            
            result.append(team_dict)

        result.sort(key=lambda t: t["season_results"]["points"], reverse=True)
        return result