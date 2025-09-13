"""In this module the api exposes the endpoints"""
import fastf1 as ff1
from .config.sql_init import engine
from .season.update_db import update_db
from .app import app

ff1.Cache.enable_cache(r'./ff1_cache')

@app.post("/{year}/season/")
async def update_season(year: int):
    await update_db(engine, year)
    return {"status": "updated"}
