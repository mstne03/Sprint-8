"""Error handling middleware"""
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError
import logging

logger = logging.getLogger(__name__)


async def error_handling_middleware(request: Request, call_next):
    """Global error handling middleware"""
    try:
        response = await call_next(request)
        return response
    except HTTPException:
        # Re-raise FastAPI HTTP exceptions
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error: {e}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Database error occurred"}
        )
    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"}
        )