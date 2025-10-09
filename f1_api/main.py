"""In this module the api exposes the endpoints"""
import fastf1 as ff1
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI
from f1_api.controllers.routes import router

ff1.Cache.enable_cache(r'C:/Users/Marc/Documents/ITA/Sprint 8/f1_api/ff1_cache')

app = FastAPI()

app.include_router(router, prefix="/api",tags=["Drivers", "Constructors", "Season", "Users", "Leagues", "User Teams"])

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)