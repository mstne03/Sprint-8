from dataclasses import dataclass

@dataclass(frozen=True)
class FantasyPrice:
    """Value object representing fantasy price (base units)"""
    amount: int

    def __post_init__(self):
        if self.amount < 0:
            raise ValueError("Price cannot be negative")
        
    @property
    def in_millions(self) -> float:
        """Return price in  millions for display"""
        return self.amount / 1_000_000
    
    def apply_multiplier(self, multiplier: float) -> 'FantasyPrice':
        """Apply a multiplier and return new price"""
        return FantasyPrice(int(self.amount * multiplier))
    
    def __str__(self) -> str:
        return f"{self.in_millions:.2f}M"
