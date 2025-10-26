"""Interface for context manager-type UOW"""
from abc import ABC, abstractmethod
from typing import Protocol

class IUnitOfWork(ABC):
    """
    Unit of work pattern for transaction management
    """
    
    @abstractmethod
    def __enter__(self):
        pass

    @abstractmethod
    def __exit__(self, exc_type, exc_val, exc_tb):
        pass

    @abstractmethod
    def commit(self) -> None:
        pass

    @abstractmethod
    def rollback(self) -> None:
        pass
