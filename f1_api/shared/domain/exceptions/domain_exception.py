class DomainException(Exception):
    """Base exception for domain errors"""
    pass

class ValidationException(DomainException):
    """Domain validation failure"""
    pass

class NotFoundException(DomainException):
    """Entity not found"""
    pass

class ConflictException(DomainException):
    """Operation conflicts with current state"""
    pass

class InsufficientFundsException(DomainException):
    """User has insufficient budget"""
    pass

class DriverLockedException(DomainException):
    """Driver is locked for market operations"""
    pass

class MaxBuyoutsExceededException(DomainException):
    """User has reached buyout limit"""
    pass
