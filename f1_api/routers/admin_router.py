"""Administrative routes"""
from fastapi import APIRouter
from f1_api.controllers.database_controller import update_db
from f1_api.config.sql_init import engine

router = APIRouter(prefix="/admin", tags=["admin"])

@router.post("/season/")
async def update_season():
    """Update all data for the current season in the database"""
    await update_db(engine)
    return {"status": "updated"}
