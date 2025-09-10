from typing import List,Optional
import logging
import io
import matplotlib
import matplotlib.pyplot as plt
import pandas as pd
from fastf1 import plotting
from fastf1.core import Lap,Laps,Telemetry,SessionResults
matplotlib.use('Agg')

def process_team(year, event, team, q_laps, q_session, circuit_info):
    print(f"Processing {event} {year} for {team}")

    plt.rcParams.update({
        'axes.facecolor': '#222831',
        'figure.facecolor': '#222831',  
        'axes.edgecolor': 'white',
        'axes.labelcolor': 'white',   
        'xtick.color': 'white',
        'ytick.color': 'white',
        'text.color': 'white',
        'legend.edgecolor': 'white',
        'legend.facecolor': '#393e46',
        'grid.color': 'white',
        'grid.linestyle': '--',
    })

    session_results:SessionResults = q_session.results
    team_laps_q:Laps = q_laps.pick_teams(team)

    drivers_q = team_laps_q["Driver"].unique().tolist()
    d_names = []
    fig, ax = plt.subplots(3,1,figsize=(15,10))
    
    if len(drivers_q) >=2:
        fig.suptitle(f'{event} | {drivers_q[0]} vs. {drivers_q[1]}')
    elif len(drivers_q) == 1:
        fig.suptitle(f'{event} | {drivers_q[0]}')
    else:
        print(f"Warning: No drivers found for team {team} in event {event}.")
        plt.close(fig)
        return

    fig.subplots_adjust(hspace=0.4)
    colors:List[str] = ['white']
    colors = [plotting.get_team_color(team, q_session)] + ['white'] * (len(drivers_q)-1)
    linestyles = ['-', '--'] * ((len(drivers_q) + 1) // 2)
    v_min:Optional[float] = None
    v_max:Optional[float] = None

    for i, driver in enumerate(drivers_q):
        try:
            best:Lap = q_laps.pick_drivers(driver).pick_fastest()
            best_lap_telemetry:Telemetry = best.get_telemetry()
            d_names.append(session_results[session_results["Abbreviation"] == driver]["FullName"].iloc[0])

            if v_min is None or best_lap_telemetry["Speed"].min() < v_min:
                v_min = best_lap_telemetry["Speed"].min()
            if v_max is None or best_lap_telemetry["Speed"].max() > v_max:
                v_max = best_lap_telemetry["Speed"].max()

            lap_time:pd.Timedelta = best["LapTime"]
            total_seconds:float = lap_time.total_seconds()
            minutes:int = int(total_seconds // 60)
            seconds:int = int(total_seconds % 60)
            milliseconds:int = int((total_seconds - minutes*60 - seconds) * 1000)
            time:str = f"{minutes}:{seconds:02d}.{milliseconds:03d}"
            color:str = colors[i]
            linestyle:str = linestyles[i]
            ax[0].plot(
                best_lap_telemetry["Distance"],
                best_lap_telemetry["Speed"],
                color=color,
                linestyle=linestyle,
                label=f'{driver} | {best["Compound"]} | {time}'
            )
            ax[0].set_xlabel("Distance")
            ax[0].set_ylabel("Speed (km/h)")

            ax[1].plot(
                best_lap_telemetry["Distance"],
                best_lap_telemetry["Throttle"],
                color=color,
                linestyle=linestyle,
                label=f'{driver}'
            )
            ax[1].set_xlabel("Distance")
            ax[1].set_ylabel("Throttle (%)")

            ax[2].plot(
                best_lap_telemetry["Distance"],
                best_lap_telemetry["Brake"],
                color=color,
                linestyle=linestyle,
                label=f'{driver}'
            )
            ax[2].set_xlabel("Distance")
            ax[2].set_ylabel("Brake (%)")
        except Exception as e:
            logging.warning(f'Error plottig for {driver} in {event}: {e}')
            plt.close(fig)
            return

    if v_min is None or v_max is None:
        logging.warning(f"No valid laps for team {team} in event {event} ({year})")
        plt.close(fig)
        return

    ax[0].vlines(
        x=circuit_info.corners["Distance"],
        ymin=v_min-1,
        ymax=v_max+10,
        linestyles='dotted',
        colors='grey',
        label='Corners'
    )
    
    ax[1].vlines(
        x=circuit_info.corners["Distance"],
        ymin=2,
        ymax=100,
        linestyles='dotted',
        colors='grey',
        label='Corners'
    )

    ax[2].vlines(
        x=circuit_info.corners["Distance"],
        ymin=0.02,
        ymax=1.0,
        linestyles='dotted',
        colors='grey',
        label='Corners'
    )

    for _, corner in circuit_info.corners.iterrows():
        txt:str = f"{corner['Number']}{corner['Letter']}"
        
        ax[0].text(
            corner['Distance'],
            v_min-5,
            txt,
            va='center_baseline',
            ha='center',
            size='small'
        )

    for a in ax:
        a.set_xticks(range(0, int(max(best_lap_telemetry["Distance"]))+500, 500))
        a.set_xlim(0, int(max(best_lap_telemetry["Distance"])))
        a.legend(loc='lower left',fontsize='small')
        a.grid()
        
    svg_io = io.StringIO()
    fig.savefig(svg_io, format='svg')
    svg_io.seek(0)
    plt.close(fig)

    svg_dict = {
        "key": f"{year}_{event}_{team}",
        "svg": svg_io.getvalue(),
        "team": team,
        "drivers": d_names,
        "drivers_acr": drivers_q,
        "chart_type": "quali_h2h",
        "session_type": "qualifying",
        "year": year,
        "event_name": event
    }

    return svg_dict
