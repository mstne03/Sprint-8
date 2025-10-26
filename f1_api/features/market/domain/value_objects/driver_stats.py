from dataclasses import dataclass

@dataclass(frozen=True)
class DriverStats:
    """Value object for driver statistics used in pricing"""
    points: int
    podiums: int
    victories: int

    def __post_init__(self):
        if self.points < 0:
            raise ValueError("Points cannot be negative")
        if self.podiums < 0:
            raise ValueError("Podiums cannot be negative")
        if self.victories < 0:
            raise ValueError("Victories cannot be negative")

    