"""This module is set to use ff1 to get and return event information"""
import logging
import time
import concurrent.futures
from typing import List,Dict
import pandas as pd
import fastf1 as ff1
from fastf1 import plotting
from fastf1.core import Session,Laps,CircuitInfo
from ff1_plot import process_team
from ff1_data import process_team_data

ff1.Cache.enable_cache(r'./ff1_cache')

def get_data_quali_charts(years:List[int]):
    """This function returns a Dictionary of SVGS 
    comparing teammates performance in 
    quali sessions"""

    plotting.setup_mpl(mpl_timedelta_support=True,color_scheme='fast-f1')

    svgs:List[Dict] = []

    for year in years:
        events_df:pd.DataFrame = ff1.get_event_schedule(year)
        round_names:List[str] = events_df.EventName.to_list()

        with concurrent.futures.ThreadPoolExecutor() as executor:
            futures = []
            for event in round_names:
                q_session:Session = ff1.get_session(year, event, 'Q')
                try:
                    q_session.load()
                    q_laps:Laps = q_session.laps
                except Exception as e:
                    logging.warning(f"Could not load laps for {event} ({year}): {e}")
                    continue
                circuit_info:CircuitInfo = q_session.get_circuit_info()
                teams:List[str] = list(q_laps["Team"].unique())
                for team in teams:
                    futures.append(
                        executor.submit(
                            process_team, year, event, team, q_laps, q_session, circuit_info
                        )
                    )
            for future in concurrent.futures.as_completed(futures):
                result = future.result()
                if result:
                    svgs.append(result)
                else:
                    logging.warning("process_team returned an empty/None result")
                    continue
    return svgs

def get_data_quali(year:int):
    plotting.setup_mpl(mpl_timedelta_support=True,color_scheme='fast-f1')

    events_df:pd.DataFrame = ff1.get_event_schedule(year)
    round_names:List[str] = events_df.EventName.to_list()

    try:
        results = []
        with concurrent.futures.ThreadPoolExecutor() as executor:
                futures = []
                for event in round_names:
                    q_session:Session = ff1.get_session(year, event, 'Q')
                    try:
                        q_session.load()
                        q_laps:Laps = q_session.laps
                    except Exception as e:
                        logging.warning(f"Could not load laps for {event} ({year}): {e}")
                        continue
                    circuit_info:CircuitInfo = q_session.get_circuit_info()
                    teams:List[str] = list(q_laps["Team"].unique())
                    for team in teams:
                        futures.append(
                            executor.submit(
                                process_team_data, year, event, team, q_laps, q_session, circuit_info
                            )
                        )
                for future in concurrent.futures.as_completed(futures):
                    result = future.result()
                    if result is not None:
                        results.append(result)
        return results
    except Exception as e:
        logging.warning(f'Error in data_get_quali: {e}')
