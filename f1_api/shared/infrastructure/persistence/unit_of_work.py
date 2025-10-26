"""Unit of Work for DB persistence"""
from sqlmodel import Session
from f1_api.shared.domain.interfaces.i_unit_of_work import IUnitOfWork

class SqlAlchemyUnitOfWork(IUnitOfWork):
    """SQLAlchemy implementation of UOW"""
    
    def __init__(self, session: Session):
        self.session = session

    def __enter__(self):
        return self
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        if exc_type is not None:
            self.rollback()
        return False
    
    def commit(self) -> None:
        self.session.commit()
    
    def rollback(self) -> None:
        self.session.rollback()