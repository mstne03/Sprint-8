"""Database dependencies for dependency injection"""
from typing import Generator
from sqlmodel import Session
from f1_api.config.sql_init import engine


def get_db_session() -> Generator[Session, None, None]:
    """
    Database session dependency
    
    Yields:
        Session: SQLModel database session
    """
    with Session(engine) as session:
        try:
            yield session
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()