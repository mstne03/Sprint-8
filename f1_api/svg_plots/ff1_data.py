from typing import List,Optional,Dict
import logging
import pandas as pd
from fastf1.core import Lap,Laps,Telemetry,SessionResults
from fastf1 import plotting

def process_team_data(year, event, team, q_laps, q_session, circuit_info):
    data:Dict[str] = {
        "year": year,
        "event": event,
        "team": team,
        "drivers": [],
        "corners": circuit_info.corners["Distance"].tolist()
    }

    session_results:SessionResults = q_session.results
    team_laps_q:Laps = q_laps.pick_teams(team)

    drivers_q = team_laps_q["Driver"].unique()
    
    color = plotting.get_team_color(team, q_session)
    
    for _, driver in enumerate(drivers_q):
        try:
            best:Lap = q_laps.pick_drivers(driver).pick_fastest()
            best_lap_telemetry:Telemetry = best.get_telemetry()
            full_name = session_results[session_results["Abbreviation"] == driver]["FullName"].iloc[0]

            lap_time:pd.Timedelta = best["LapTime"]
            total_seconds:float = lap_time.total_seconds()
            minutes:int = int(total_seconds // 60)
            seconds:int = int(total_seconds % 60)
            milliseconds:int = int((total_seconds - minutes*60 - seconds) * 1000)
            time:str = f"{minutes}:{seconds:02d}.{milliseconds:03d}"

            data["drivers"].append({
                "full_name": full_name,
                "abbreviation": driver,
                "time_string": time,
                "compound": best["Compound"],
                "lap_telemetry": {
                    "speed": best_lap_telemetry["Speed"].tolist(),
                    "throttle": best_lap_telemetry["Throttle"].tolist(),
                    "brake": best_lap_telemetry["Brake"].tolist(),
                    "nGear": best_lap_telemetry["nGear"].tolist(),
                    "RPM": best_lap_telemetry["RPM"].tolist(),
                    "DRS": best_lap_telemetry["DRS"].tolist(),
                    "distance": best_lap_telemetry["Distance"].tolist(),
                    "legend_label": f'{driver} | {best["Compound"]} | {time}'
                },
                "color": color,
            })
        except Exception as e:
            logging.warning(f'An exception occured at process_team_data: {e}')
            return

    return data