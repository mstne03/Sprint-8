from datetime import datetime
from pydantic_settings import BaseSettings

class MarketConfig(BaseSettings):
    """Configuration of market feature variables"""

    BASE_PRICE: int = 10_000_000
    POINTS_MULTIPLIER: int = 10_000
    PODIUM_BONUS: int = 50_000
    VICTORY_BONUS: int = 10_000

    BUYOUT_MULTIPLIER: float = 1.3
    LOCK_DAYS_AFTER_PURCHASE: int = 7
    SELL_TO_MARKET_REFUND: float = 0.8

    MAX_BUYOUTS_PER_USER_PAIR_PER_SEASON: int = 2
    MAX_DRIVERS_PER_USER: int = 4

    INITIAL_BUDGET: int = 100_000_000

    CURRENT_SEASON: int = datetime.now().year

    class Config:
        env_prefix = "MARKET_"
        env_file = ".env"