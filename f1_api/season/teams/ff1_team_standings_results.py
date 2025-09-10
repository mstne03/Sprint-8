import fastf1 as ff1

def get_standings_data(schedule,year,team):
    standings = []

    for _,event in schedule.iterrows():
        session = ""

        if event["EventFormat"] != "testing":
            session = ff1.get_session(year,event["EventName"],'R')

            session.load(laps=False, telemetry=False, weather=False, messages=False)
        else:
            continue

        sprint = None
        sprint_results = 0

        if event["EventFormat"] == "sprint_qualifying":
            sprint = ff1.get_session(year,event["EventName"],'S')
            sprint.load(laps=False, telemetry=False, weather=False, messages=False)

        results = sum(session.results[session.results["TeamName"] == team]["Points"].tolist())

        if sprint is not None:
            sprint_results = sum(sprint.results[sprint.results["TeamName"] == team]["Points"].tolist())

        standings.append(results+sprint_results)

    return standings
