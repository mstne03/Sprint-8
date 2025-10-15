"""Base controller with common functionality"""
from abc import ABC
from sqlmodel import Session


class BaseController(ABC):
    """Base controller class with common functionality"""
    
    def __init__(self, session: Session):
        """Initialize controller with database session"""
        self.session = session
    
    def __enter__(self):
        """Context manager entry"""
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit - handle session cleanup"""
        if exc_type:
            self.session.rollback()
        else:
            self.session.commit()
    
    def commit(self):
        """Explicitly commit transaction"""
        self.session.commit()
    
    def rollback(self):
        """Explicitly rollback transaction"""
        self.session.rollback()