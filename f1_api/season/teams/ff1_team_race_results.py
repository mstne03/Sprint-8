import fastf1 as ff1

def get_race_results(schedule,year,team):
    raceResults = []

    for _,event in schedule.iterrows():
        session = ""

        if event["EventFormat"] != "testing":
            session = ff1.get_session(year,event["EventName"],'R')

            session.load(laps=False, telemetry=False, weather=False, messages=False)
        else:
            continue

        sprint = None
        sprint_positions = "None"

        if event["EventFormat"] == "sprint_qualifying":
            sprint = ff1.get_session(year,event["EventName"],'S')
            sprint.load(laps=False, telemetry=False, weather=False, messages=False)

        results = session.results[session.results["TeamName"] == team]
        race_positions = dict(zip(results["DriverId"], results["Position"]))

        if sprint is not None:
            sprint_results = sprint.results[sprint.results["TeamName"] == team]
            sprint_positions = dict(zip(sprint_results["DriverId"], sprint_results["Position"]))

        raceResults.append({
            "race": race_positions,
            "sprint": sprint_positions
        })

    return raceResults

