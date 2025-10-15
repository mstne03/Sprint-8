"""Routers module - API route definitions"""
from .leagues_router import router as leagues_router
from .teams_router import router as teams_router  
from .admin_router import router as admin_router

__all__ = [
    "leagues_router",
    "teams_router", 
    "admin_router"
]