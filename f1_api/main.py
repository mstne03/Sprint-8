"""In this module the api exposes the endpoints"""
import fastf1 as ff1
from .season.ff1_season_data import get_season_data
from .app import app
from .config.sql_connect import  mycursor

ff1.Cache.enable_cache(r'./ff1_cache')

@app.get("/{year}/season/")
async def season_data(
    year: int
):
    """Returns season object with 
    all season relevant data"""
    data = get_season_data(year)

    return data
