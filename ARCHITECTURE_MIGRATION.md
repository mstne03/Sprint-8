# 🏗️ F1 Fantasy Backend - Feature-Based Architecture Migration

## 📋 Overview

This document outlines the complete migration from the current **layer-based architecture** to a **feature-based (vertical slice) architecture** following SOLID principles.

**Current State:**
- 17 controllers with mixed responsibilities
- 1,058-line `market_controller.py` (God Object)
- Business logic scattered across layers
- Duplicated pricing logic in 3 files
- No dependency injection
- Direct coupling to concrete implementations

**Target State:**
- Feature-based modular structure
- Clean separation of concerns (Domain/Application/Infrastructure/Presentation)
- SOLID principles compliance
- Testable, maintainable, scalable codebase

---

## 🎯 Target Architecture Structure

```
f1_api/
├── features/
│   ├── market/                        # Driver trading & transactions
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   ├── value_objects/
│   │   │   ├── services/
│   │   │   └── interfaces/
│   │   ├── application/
│   │   │   ├── use_cases/
│   │   │   └── dto/
│   │   ├── infrastructure/
│   │   │   ├── persistence/
│   │   │   └── models/
│   │   └── presentation/
│   │       └── routers/
│   │
│   ├── teams/                         # User teams & lineup management
│   ├── drivers/                       # Driver data & statistics
│   ├── leagues/                       # League management
│   └── f1_data/                       # F1 events, sessions, results
│
├── shared/                            # Cross-cutting concerns
│   ├── domain/
│   ├── infrastructure/
│   └── config/
│
├── dependencies.py                    # Dependency injection setup
└── main.py                           # Application entry point
```

---

## 📊 Migration Roadmap

### **Phase 1: Setup & Shared Infrastructure** ✅ HIGH PRIORITY
**Goal:** Create foundation for feature modules

#### Step 1.1: Create Directory Structure

**PowerShell (Windows):**
```powershell
# Navigate to f1_api directory
cd f1_api

# Create feature directories - Market
mkdir -Force features\market\domain\entities, features\market\domain\value_objects, features\market\domain\services, features\market\domain\interfaces, features\market\application\use_cases, features\market\application\dto\requests, features\market\application\dto\responses, features\market\infrastructure\persistence, features\market\infrastructure\models, features\market\presentation\routers

# Create feature directories - Teams
mkdir -Force features\teams\domain\entities, features\teams\domain\value_objects, features\teams\domain\services, features\teams\domain\interfaces, features\teams\application\use_cases, features\teams\application\dto\requests, features\teams\application\dto\responses, features\teams\infrastructure\persistence, features\teams\infrastructure\models, features\teams\presentation\routers

# Create feature directories - Drivers
mkdir -Force features\drivers\domain\entities, features\drivers\domain\services, features\drivers\domain\interfaces, features\drivers\application\use_cases, features\drivers\application\dto, features\drivers\infrastructure\persistence, features\drivers\infrastructure\models, features\drivers\infrastructure\external, features\drivers\presentation\routers

# Create feature directories - Leagues
mkdir -Force features\leagues\domain\entities, features\leagues\domain\services, features\leagues\domain\interfaces, features\leagues\application\use_cases, features\leagues\application\dto, features\leagues\infrastructure\persistence, features\leagues\infrastructure\models, features\leagues\presentation\routers

# Create feature directories - F1 Data
mkdir -Force features\f1_data\domain\entities, features\f1_data\domain\services, features\f1_data\application\use_cases, features\f1_data\infrastructure\persistence, features\f1_data\infrastructure\models, features\f1_data\infrastructure\external, features\f1_data\presentation\routers

# Create shared directories
mkdir -Force shared\domain\interfaces, shared\domain\value_objects, shared\domain\exceptions, shared\infrastructure\persistence, shared\infrastructure\cache, shared\config

# Create __init__.py files (PowerShell)
New-Item -ItemType File -Path features\__init__.py -Force
New-Item -ItemType File -Path features\market\__init__.py -Force
New-Item -ItemType File -Path features\market\domain\__init__.py -Force
New-Item -ItemType File -Path features\market\domain\entities\__init__.py -Force
New-Item -ItemType File -Path features\market\domain\value_objects\__init__.py -Force
New-Item -ItemType File -Path features\market\domain\services\__init__.py -Force
New-Item -ItemType File -Path features\market\domain\interfaces\__init__.py -Force
New-Item -ItemType File -Path features\market\application\__init__.py -Force
New-Item -ItemType File -Path features\market\application\use_cases\__init__.py -Force
New-Item -ItemType File -Path features\market\application\dto\__init__.py -Force
New-Item -ItemType File -Path features\market\application\dto\requests\__init__.py -Force
New-Item -ItemType File -Path features\market\application\dto\responses\__init__.py -Force
New-Item -ItemType File -Path features\market\infrastructure\__init__.py -Force
New-Item -ItemType File -Path features\market\infrastructure\persistence\__init__.py -Force
New-Item -ItemType File -Path features\market\infrastructure\models\__init__.py -Force
New-Item -ItemType File -Path features\market\presentation\__init__.py -Force
New-Item -ItemType File -Path features\market\presentation\routers\__init__.py -Force
New-Item -ItemType File -Path shared\__init__.py -Force
New-Item -ItemType File -Path shared\domain\__init__.py -Force
New-Item -ItemType File -Path shared\domain\interfaces\__init__.py -Force
New-Item -ItemType File -Path shared\domain\value_objects\__init__.py -Force
New-Item -ItemType File -Path shared\domain\exceptions\__init__.py -Force
New-Item -ItemType File -Path shared\infrastructure\__init__.py -Force
New-Item -ItemType File -Path shared\infrastructure\persistence\__init__.py -Force
New-Item -ItemType File -Path shared\infrastructure\cache\__init__.py -Force
New-Item -ItemType File -Path shared\config\__init__.py -Force
```

**Bash/Linux/Mac:**
```bash
# Create feature directories
mkdir -p features/market/{domain/{entities,value_objects,services,interfaces},application/{use_cases,dto/{requests,responses}},infrastructure/{persistence,models},presentation/routers}
mkdir -p features/teams/{domain/{entities,value_objects,services,interfaces},application/{use_cases,dto/{requests,responses}},infrastructure/{persistence,models},presentation/routers}
mkdir -p features/drivers/{domain/{entities,services,interfaces},application/{use_cases,dto},infrastructure/{persistence,models,external},presentation/routers}
mkdir -p features/leagues/{domain/{entities,services,interfaces},application/{use_cases,dto},infrastructure/{persistence,models},presentation/routers}
mkdir -p features/f1_data/{domain/{entities,services},application/{use_cases},infrastructure/{persistence,models,external},presentation/routers}

# Create shared directories
mkdir -p shared/domain/{interfaces,value_objects,exceptions}
mkdir -p shared/infrastructure/{persistence,cache}
mkdir -p shared/config

# Create __init__.py files
touch features/__init__.py
touch features/market/__init__.py
# ... (repeat for all feature subdirectories)
```

#### Step 1.2: Create Shared Base Interfaces
**File:** `shared/domain/interfaces/i_repository.py`
```python
from abc import ABC, abstractmethod
from typing import Generic, TypeVar, Optional, List

T = TypeVar('T')
ID = TypeVar('ID')

class IRepository(ABC, Generic[T, ID]):
    """Generic repository interface"""
    
    @abstractmethod
    def get_by_id(self, id: ID) -> Optional[T]:
        pass
    
    @abstractmethod
    def get_all(self) -> List[T]:
        pass
    
    @abstractmethod
    def add(self, entity: T) -> T:
        pass
    
    @abstractmethod
    def update(self, entity: T) -> T:
        pass
    
    @abstractmethod
    def delete(self, id: ID) -> bool:
        pass
```

**File:** `shared/domain/interfaces/i_unit_of_work.py`
```python
from abc import ABC, abstractmethod
from typing import Protocol

class IUnitOfWork(ABC):
    """Unit of Work pattern for transaction management"""
    
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
```

**File:** `shared/infrastructure/persistence/base_repository.py`
```python
from typing import Generic, TypeVar, Optional, List, Type
from sqlmodel import Session, select, SQLModel

T = TypeVar('T', bound=SQLModel)
ID = TypeVar('ID')

class BaseRepository(Generic[T, ID]):
    """Base repository implementation with common CRUD operations"""
    
    def __init__(self, session: Session, model: Type[T]):
        self.session = session
        self.model = model
    
    def get_by_id(self, id: ID) -> Optional[T]:
        return self.session.get(self.model, id)
    
    def get_all(self) -> List[T]:
        return list(self.session.exec(select(self.model)))
    
    def add(self, entity: T) -> T:
        self.session.add(entity)
        return entity
    
    def update(self, entity: T) -> T:
        self.session.add(entity)
        return entity
    
    def delete(self, id: ID) -> bool:
        entity = self.get_by_id(id)
        if entity:
            self.session.delete(entity)
            return True
        return False
```

**File:** `shared/infrastructure/persistence/unit_of_work.py`
```python
from sqlmodel import Session
from shared.domain.interfaces.i_unit_of_work import IUnitOfWork

class SqlAlchemyUnitOfWork(IUnitOfWork):
    """SQLAlchemy implementation of Unit of Work"""
    
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
```

#### Step 1.3: Create Shared Exceptions
**File:** `shared/domain/exceptions/domain_exception.py`
```python
class DomainException(Exception):
    """Base exception for domain errors"""
    pass

class ValidationException(DomainException):
    """Raised when domain validation fails"""
    pass

class NotFoundException(DomainException):
    """Raised when entity not found"""
    pass

class ConflictException(DomainException):
    """Raised when operation conflicts with current state"""
    pass

class InsufficientFundsException(DomainException):
    """Raised when user has insufficient budget"""
    pass

class DriverLockedException(DomainException):
    """Raised when trying to operate on locked driver"""
    pass

class MaxBuyoutsExceededException(DomainException):
    """Raised when max buyouts limit reached"""
    pass
```

#### Step 1.4: Create Shared Configuration
**File:** `shared/config/market_config.py`
```python
from pydantic_settings import BaseSettings

class MarketConfig(BaseSettings):
    """Configuration for market feature"""
    
    # Pricing
    BASE_PRICE: int = 10_000_000  # 10M
    POINTS_MULTIPLIER: int = 10_000  # 10k per point
    PODIUM_BONUS: int = 50_000  # 50k per podium
    VICTORY_BONUS: int = 100_000  # 100k per victory
    
    # Market rules
    BUYOUT_MULTIPLIER: float = 1.3  # 130% of acquisition price
    LOCK_DAYS_AFTER_PURCHASE: int = 7  # Days driver is locked
    SELL_TO_MARKET_REFUND: float = 0.8  # 80% refund
    MAX_BUYOUTS_PER_USER_PAIR_PER_SEASON: int = 2
    MAX_DRIVERS_PER_USER: int = 4  # 3 lineup + 1 reserve
    
    # Budget
    INITIAL_BUDGET: int = 100_000_000  # 100M
    
    # Season
    CURRENT_SEASON: int = 2025  # TODO: Make dynamic
    
    class Config:
        env_prefix = "MARKET_"
```

---

### **Phase 2: Extract Pricing Service** ⚡ CRITICAL PATH
**Goal:** Eliminate duplicated pricing logic (currently in 3 files)

**Why First?**
- Most duplicated code (exact same formula 3 times)
- Self-contained business logic
- No external dependencies
- Quick win to prove architecture works

#### Step 2.1: Create Shared Value Objects
**File:** `shared/domain/value_objects/driver_stats.py`
```python
from dataclasses import dataclass

@dataclass(frozen=True)
class DriverStats:
    """Value object for driver statistics used across features"""
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
    
    @property
    def has_victories(self) -> bool:
        """Check if driver has any victories"""
        return self.victories > 0
    
    @property
    def has_podiums(self) -> bool:
        """Check if driver has any podiums"""
        return self.podiums > 0
```

#### Step 2.2: Create Market-Specific Value Objects

**File:** `features/market/domain/value_objects/fantasy_price.py`
```python
from dataclasses import dataclass

@dataclass(frozen=True)
class FantasyPrice:
    """Value object representing a fantasy price (always in base units)"""
    amount: int  # Price in base units (dollars, not millions)
    
    def __post_init__(self):
        if self.amount < 0:
            raise ValueError("Price cannot be negative")
    
    @property
    def in_millions(self) -> float:
        """Return price in millions for display"""
        return self.amount / 1_000_000
    
    def apply_multiplier(self, multiplier: float) -> 'FantasyPrice':
        """Apply a multiplier and return new price"""
        return FantasyPrice(int(self.amount * multiplier))
    
    def __str__(self) -> str:
        return f"${self.in_millions:.6f}M"
```

#### Step 2.3: Create Pricing Strategy Interface
**File:** `features/market/domain/interfaces/i_pricing_strategy.py`
```python
from abc import ABC, abstractmethod
from shared.domain.value_objects.driver_stats import DriverStats
from features.market.domain.value_objects.fantasy_price import FantasyPrice

class IPricingStrategy(ABC):
    """Interface for driver pricing strategies"""
    
    @abstractmethod
    def calculate_price(self, stats: DriverStats) -> FantasyPrice:
        """Calculate fantasy price based on driver stats"""
        pass
```

#### Step 2.4: Create Pricing Service
**File:** `features/market/domain/services/pricing_service.py`
```python
from features.market.domain.interfaces.i_pricing_strategy import IPricingStrategy
from shared.domain.value_objects.driver_stats import DriverStats
from features.market.domain.value_objects.fantasy_price import FantasyPrice
from shared.config.market_config import MarketConfig

class StandardPricingStrategy(IPricingStrategy):
    """Standard pricing strategy: 10M + (points × 10k) + (podiums × 50k) + (victories × 100k)"""
    
    def __init__(self, config: MarketConfig):
        self.config = config
    
    def calculate_price(self, stats: DriverStats) -> FantasyPrice:
        """Calculate fantasy price based on formula"""
        amount = (
            self.config.BASE_PRICE +
            int(stats.points) * self.config.POINTS_MULTIPLIER +
            stats.podiums * self.config.PODIUM_BONUS +
            stats.victories * self.config.VICTORY_BONUS
        )
        return FantasyPrice(amount)

class PricingService:
    """Service for all pricing operations"""
    
    def __init__(self, strategy: IPricingStrategy):
        self.strategy = strategy
    
    def calculate_fantasy_price(self, stats: DriverStats) -> FantasyPrice:
        """Calculate driver fantasy price"""
        return self.strategy.calculate_price(stats)
    
    def calculate_buyout_price(self, acquisition_price: FantasyPrice, multiplier: float) -> FantasyPrice:
        """Calculate buyout price (acquisition price × multiplier)"""
        return acquisition_price.apply_multiplier(multiplier)
    
    def calculate_refund_price(self, acquisition_price: FantasyPrice, refund_rate: float) -> FantasyPrice:
        """Calculate refund price (acquisition price × refund rate)"""
        return acquisition_price.apply_multiplier(refund_rate)
```

#### Step 2.5: Update Existing Controllers to Use Pricing Service
**Target Files:**
1. `controllers/market_controller.py` line 107
2. `controllers/driver_ownership_controller.py` line 177
3. `controllers/user_teams_controller_new.py` line 16

**Example Change in `market_controller.py`:**
```python
# BEFORE (line 107)
"price": 10_000_000 + int(points) * 10_000 + podiums * 50_000 + victories * 100_000

# AFTER
from shared.domain.value_objects.driver_stats import DriverStats
from features.market.domain.services.pricing_service import PricingService

# In __init__:
self.pricing_service = PricingService(StandardPricingStrategy(MarketConfig()))

# In method:
stats = DriverStats(points=int(points), podiums=podiums, victories=victories)
price = self.pricing_service.calculate_fantasy_price(stats).amount
```

**Status:** ✅ Complete when all 3 files use PricingService

---

### **Phase 3: Migrate Market Feature** 🎯 MAIN GOAL
**Goal:** Transform `market_controller.py` (1,058 lines) into feature-based structure

#### Step 3.1: Extract Domain Entities
**File:** `features/market/domain/entities/driver_ownership.py`
```python
from dataclasses import dataclass
from datetime import datetime
from typing import Optional

@dataclass
class DriverOwnership:
    """Domain entity for driver ownership (pure business logic, no SQLModel)"""
    id: Optional[int]
    driver_id: int
    league_id: int
    owner_user_id: Optional[int]
    is_listed_for_sale: bool
    listing_price: Optional[int]
    acquisition_price: int
    acquired_at: Optional[datetime]
    locked_until: Optional[datetime]
    
    def is_free_agent(self) -> bool:
        """Check if driver is a free agent"""
        return self.owner_user_id is None
    
    def is_locked(self) -> bool:
        """Check if driver is locked"""
        if self.locked_until is None:
            return False
        return datetime.now() < self.locked_until
    
    def can_be_sold(self) -> bool:
        """Check if driver can be sold"""
        return not self.is_free_agent() and not self.is_locked()
    
    def lock_until(self, lock_date: datetime) -> None:
        """Lock driver until specific date"""
        self.locked_until = lock_date
```

**File:** `features/market/domain/entities/market_transaction.py`
```python
from dataclasses import dataclass
from datetime import datetime
from enum import Enum
from typing import Optional

class TransactionType(Enum):
    BUY_FROM_MARKET = "buy_from_market"
    BUY_FROM_USER = "buy_from_user"
    SELL_TO_MARKET = "sell_to_market"
    BUYOUT = "buyout"

@dataclass
class MarketTransaction:
    """Domain entity for market transaction"""
    id: Optional[int]
    league_id: int
    driver_id: int
    buyer_user_id: Optional[int]
    seller_user_id: Optional[int]
    transaction_type: TransactionType
    price: int
    created_at: datetime
```

#### Step 3.2: Create Repository Interfaces
**File:** `features/market/domain/interfaces/i_ownership_repository.py`
```python
from abc import ABC, abstractmethod
from typing import List, Optional
from features.market.domain.entities.driver_ownership import DriverOwnership

class IOwnershipRepository(ABC):
    """Interface for driver ownership repository"""
    
    @abstractmethod
    def get_by_id(self, ownership_id: int) -> Optional[DriverOwnership]:
        pass
    
    @abstractmethod
    def get_by_driver_and_league(self, driver_id: int, league_id: int) -> Optional[DriverOwnership]:
        pass
    
    @abstractmethod
    def get_user_drivers(self, user_id: int, league_id: int) -> List[DriverOwnership]:
        pass
    
    @abstractmethod
    def get_free_drivers(self, league_id: int) -> List[DriverOwnership]:
        pass
    
    @abstractmethod
    def get_drivers_for_sale(self, league_id: int) -> List[DriverOwnership]:
        pass
    
    @abstractmethod
    def count_user_drivers(self, user_id: int, league_id: int) -> int:
        pass
    
    @abstractmethod
    def assign_to_user(self, ownership: DriverOwnership, user_id: int, acquisition_price: int) -> DriverOwnership:
        pass
    
    @abstractmethod
    def release_to_market(self, ownership: DriverOwnership) -> DriverOwnership:
        pass
    
    @abstractmethod
    def list_for_sale(self, ownership: DriverOwnership, listing_price: int) -> DriverOwnership:
        pass
    
    @abstractmethod
    def unlist_from_sale(self, ownership: DriverOwnership) -> DriverOwnership:
        pass
```

#### Step 3.3: Create Domain Services
**File:** `features/market/domain/services/buyout_validator.py`
```python
from features.market.domain.entities.driver_ownership import DriverOwnership
from shared.domain.exceptions.domain_exception import (
    ValidationException, 
    DriverLockedException, 
    MaxBuyoutsExceededException
)
from shared.config.market_config import MarketConfig

class BuyoutValidator:
    """Domain service for validating buyout operations"""
    
    def __init__(self, config: MarketConfig):
        self.config = config
    
    def validate_buyout_eligible(self, ownership: DriverOwnership) -> None:
        """Validate driver is eligible for buyout"""
        if ownership.is_free_agent():
            raise ValidationException("Cannot buyout free agent driver")
        
        if ownership.is_locked():
            raise DriverLockedException(f"Driver is locked until {ownership.locked_until}")
        
        if ownership.is_listed_for_sale:
            raise ValidationException("Cannot buyout driver already listed for sale")
    
    def validate_buyout_history(self, buyer_id: int, seller_id: int, existing_buyouts: int) -> None:
        """Validate buyout history between users"""
        if existing_buyouts >= self.config.MAX_BUYOUTS_PER_USER_PAIR_PER_SEASON:
            raise MaxBuyoutsExceededException(
                f"Maximum {self.config.MAX_BUYOUTS_PER_USER_PAIR_PER_SEASON} buyouts "
                f"between users already executed this season"
            )
```

**File:** `features/market/domain/services/tier_classifier.py`
```python
from typing import List, Dict
from shared.domain.value_objects.driver_stats import DriverStats

class DriverTier:
    """Value object for driver tier classification"""
    TIER_A = "A"
    TIER_B = "B"
    TIER_C = "C"

class TierClassifier:
    """Domain service for classifying drivers into tiers"""
    
    def classify_drivers(self, drivers_with_points: List[Dict]) -> Dict[str, List[Dict]]:
        """Classify drivers into tiers A/B/C based on points"""
        if not drivers_with_points:
            return {DriverTier.TIER_A: [], DriverTier.TIER_B: [], DriverTier.TIER_C: []}
        
        # Sort by points descending
        sorted_drivers = sorted(
            drivers_with_points,
            key=lambda d: d.get("season_results", {}).get("points", 0),
            reverse=True
        )
        
        total_drivers = len(sorted_drivers)
        tier_a_count = max(1, total_drivers // 3)
        tier_b_count = max(1, total_drivers // 3)
        
        return {
            DriverTier.TIER_A: sorted_drivers[:tier_a_count],
            DriverTier.TIER_B: sorted_drivers[tier_a_count:tier_a_count + tier_b_count],
            DriverTier.TIER_C: sorted_drivers[tier_a_count + tier_b_count:]
        }
```

#### Step 3.4: Create Use Cases
Each use case = ~100 lines extracted from market_controller.py

**File:** `features/market/application/use_cases/buy_driver_use_case.py`
```python
from dataclasses import dataclass
from datetime import datetime, timedelta
from features.market.domain.interfaces.i_ownership_repository import IOwnershipRepository
from features.market.domain.interfaces.i_transaction_repository import ITransactionRepository
from features.market.domain.services.pricing_service import PricingService
from features.market.domain.entities.market_transaction import MarketTransaction, TransactionType
from shared.domain.interfaces.i_unit_of_work import IUnitOfWork
from shared.domain.exceptions.domain_exception import (
    NotFoundException,
    InsufficientFundsException,
    ValidationException
)
from shared.config.market_config import MarketConfig

@dataclass
class BuyDriverRequest:
    """DTO for buy driver request"""
    user_id: int
    driver_id: int
    league_id: int
    current_budget: int

@dataclass
class BuyDriverResponse:
    """DTO for buy driver response"""
    ownership_id: int
    transaction_id: int
    price_paid: int
    remaining_budget: int
    locked_until: datetime

class BuyDriverUseCase:
    """Use case for buying a driver from market or another user"""
    
    def __init__(
        self,
        ownership_repo: IOwnershipRepository,
        transaction_repo: ITransactionRepository,
        pricing_service: PricingService,
        uow: IUnitOfWork,
        config: MarketConfig
    ):
        self.ownership_repo = ownership_repo
        self.transaction_repo = transaction_repo
        self.pricing_service = pricing_service
        self.uow = uow
        self.config = config
    
    def execute(self, request: BuyDriverRequest) -> BuyDriverResponse:
        """Execute buy driver operation"""
        
        with self.uow:
            # 1. Validate driver exists and is available
            ownership = self.ownership_repo.get_by_driver_and_league(
                request.driver_id, 
                request.league_id
            )
            if not ownership:
                raise NotFoundException(f"Driver {request.driver_id} not found in league")
            
            if not ownership.is_free_agent() and not ownership.is_listed_for_sale:
                raise ValidationException("Driver is not available for purchase")
            
            # 2. Check driver slots
            user_driver_count = self.ownership_repo.count_user_drivers(
                request.user_id, 
                request.league_id
            )
            if user_driver_count >= self.config.MAX_DRIVERS_PER_USER:
                raise ValidationException(
                    f"Cannot own more than {self.config.MAX_DRIVERS_PER_USER} drivers"
                )
            
            # 3. Determine price
            if ownership.is_free_agent():
                # Use fantasy price
                price = ownership.acquisition_price  # Already calculated
                seller_id = None
                transaction_type = TransactionType.BUY_FROM_MARKET
            else:
                # Use listing price
                price = ownership.listing_price
                seller_id = ownership.owner_user_id
                transaction_type = TransactionType.BUY_FROM_USER
            
            # 4. Check budget
            if request.current_budget < price:
                raise InsufficientFundsException(
                    f"Insufficient funds. Price: {price}, Budget: {request.current_budget}"
                )
            
            # 5. Calculate lock date
            lock_date = datetime.now() + timedelta(days=self.config.LOCK_DAYS_AFTER_PURCHASE)
            
            # 6. Assign driver to user
            ownership = self.ownership_repo.assign_to_user(
                ownership, 
                request.user_id, 
                price
            )
            ownership.lock_until(lock_date)
            
            # 7. Create transaction record
            transaction = MarketTransaction(
                id=None,
                league_id=request.league_id,
                driver_id=request.driver_id,
                buyer_user_id=request.user_id,
                seller_user_id=seller_id,
                transaction_type=transaction_type,
                price=price,
                created_at=datetime.now()
            )
            saved_transaction = self.transaction_repo.add(transaction)
            
            self.uow.commit()
            
            return BuyDriverResponse(
                ownership_id=ownership.id,
                transaction_id=saved_transaction.id,
                price_paid=price,
                remaining_budget=request.current_budget - price,
                locked_until=lock_date
            )
```

**Additional Use Cases to Create:**
1. `sell_to_market_use_case.py` - Lines 540-600 from market_controller
2. `list_for_sale_use_case.py` - Lines 620-680 from market_controller
3. `unlist_driver_use_case.py` - Lines 700-740 from market_controller
4. `execute_buyout_use_case.py` - Lines 760-900 from market_controller (most complex)
5. `initialize_team_drivers_use_case.py` - Lines 159-277 from market_controller
6. `get_free_drivers_use_case.py` - Lines 1019-1033 from market_controller
7. `get_drivers_for_sale_use_case.py` - Lines 1035-1045 from market_controller

#### Step 3.5: Create Infrastructure Layer
**File:** `features/market/infrastructure/models/driver_ownership_model.py`
```python
from sqlmodel import SQLModel, Field
from datetime import datetime
from typing import Optional

class DriverOwnershipModel(SQLModel, table=True):
    """SQLModel for driver_ownership table"""
    __tablename__ = "driver_ownership"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    driver_id: int = Field(foreign_key="drivers.id")
    league_id: int = Field(foreign_key="leagues.id")
    owner_user_id: Optional[int] = Field(default=None, foreign_key="users.id")
    is_listed_for_sale: bool = Field(default=False)
    listing_price: Optional[int] = None
    acquisition_price: int
    acquired_at: Optional[datetime] = None
    locked_until: Optional[datetime] = None
```

**File:** `features/market/infrastructure/persistence/ownership_repository.py`
```python
from typing import List, Optional
from sqlmodel import Session, select
from features.market.domain.interfaces.i_ownership_repository import IOwnershipRepository
from features.market.domain.entities.driver_ownership import DriverOwnership
from features.market.infrastructure.models.driver_ownership_model import DriverOwnershipModel
from datetime import datetime

class OwnershipRepository(IOwnershipRepository):
    """SQLModel implementation of ownership repository"""
    
    def __init__(self, session: Session):
        self.session = session
    
    def get_by_id(self, ownership_id: int) -> Optional[DriverOwnership]:
        model = self.session.get(DriverOwnershipModel, ownership_id)
        return self._to_entity(model) if model else None
    
    def get_by_driver_and_league(self, driver_id: int, league_id: int) -> Optional[DriverOwnership]:
        model = self.session.exec(
            select(DriverOwnershipModel)
            .where(DriverOwnershipModel.driver_id == driver_id)
            .where(DriverOwnershipModel.league_id == league_id)
        ).first()
        return self._to_entity(model) if model else None
    
    def get_free_drivers(self, league_id: int) -> List[DriverOwnership]:
        models = self.session.exec(
            select(DriverOwnershipModel)
            .where(DriverOwnershipModel.league_id == league_id)
            .where(DriverOwnershipModel.owner_user_id == None)
        ).all()
        return [self._to_entity(m) for m in models]
    
    def assign_to_user(self, ownership: DriverOwnership, user_id: int, acquisition_price: int) -> DriverOwnership:
        model = self._to_model(ownership)
        model.owner_user_id = user_id
        model.acquisition_price = acquisition_price
        model.acquired_at = datetime.now()
        model.is_listed_for_sale = False
        model.listing_price = None
        self.session.add(model)
        return self._to_entity(model)
    
    def _to_entity(self, model: DriverOwnershipModel) -> DriverOwnership:
        """Convert SQLModel to domain entity"""
        return DriverOwnership(
            id=model.id,
            driver_id=model.driver_id,
            league_id=model.league_id,
            owner_user_id=model.owner_user_id,
            is_listed_for_sale=model.is_listed_for_sale,
            listing_price=model.listing_price,
            acquisition_price=model.acquisition_price,
            acquired_at=model.acquired_at,
            locked_until=model.locked_until
        )
    
    def _to_model(self, entity: DriverOwnership) -> DriverOwnershipModel:
        """Convert domain entity to SQLModel"""
        return DriverOwnershipModel(
            id=entity.id,
            driver_id=entity.driver_id,
            league_id=entity.league_id,
            owner_user_id=entity.owner_user_id,
            is_listed_for_sale=entity.is_listed_for_sale,
            listing_price=entity.listing_price,
            acquisition_price=entity.acquisition_price,
            acquired_at=entity.acquired_at,
            locked_until=entity.locked_until
        )
```

#### Step 3.6: Create Presentation Layer (Router)
**File:** `features/market/presentation/routers/market_router.py`
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session
from features.market.application.use_cases.buy_driver_use_case import (
    BuyDriverUseCase, 
    BuyDriverRequest
)
from shared.domain.exceptions.domain_exception import (
    DomainException,
    NotFoundException,
    InsufficientFundsException
)

router = APIRouter(prefix="/market", tags=["market"])

@router.post("/buy-driver")
def buy_driver(
    request: BuyDriverRequest,
    use_case: BuyDriverUseCase = Depends(get_buy_driver_use_case)
):
    """Buy a driver from market or another user"""
    try:
        result = use_case.execute(request)
        return {
            "success": True,
            "data": result
        }
    except NotFoundException as e:
        raise HTTPException(status_code=404, detail=str(e))
    except InsufficientFundsException as e:
        raise HTTPException(status_code=400, detail=str(e))
    except DomainException as e:
        raise HTTPException(status_code=400, detail=str(e))

# Additional endpoints:
# @router.post("/sell-to-market")
# @router.post("/list-for-sale")
# @router.delete("/unlist/{driver_id}")
# @router.post("/buyout")
# @router.get("/free-drivers")
# @router.get("/drivers-for-sale")
```

#### Step 3.7: Setup Dependency Injection
**File:** `features/market/presentation/dependencies.py`
```python
from fastapi import Depends
from sqlmodel import Session
from features.market.application.use_cases.buy_driver_use_case import BuyDriverUseCase
from features.market.infrastructure.persistence.ownership_repository import OwnershipRepository
from features.market.infrastructure.persistence.transaction_repository import TransactionRepository
from features.market.domain.services.pricing_service import PricingService, StandardPricingStrategy
from shared.infrastructure.persistence.unit_of_work import SqlAlchemyUnitOfWork
from shared.config.market_config import MarketConfig
from f1_api.dependencies import get_db_session

def get_market_config() -> MarketConfig:
    """Get market configuration"""
    return MarketConfig()

def get_pricing_service(
    config: MarketConfig = Depends(get_market_config)
) -> PricingService:
    """Get pricing service with strategy"""
    strategy = StandardPricingStrategy(config)
    return PricingService(strategy)

def get_buy_driver_use_case(
    session: Session = Depends(get_db_session),
    pricing_service: PricingService = Depends(get_pricing_service),
    config: MarketConfig = Depends(get_market_config)
) -> BuyDriverUseCase:
    """Get buy driver use case with all dependencies"""
    ownership_repo = OwnershipRepository(session)
    transaction_repo = TransactionRepository(session)
    uow = SqlAlchemyUnitOfWork(session)
    
    return BuyDriverUseCase(
        ownership_repo=ownership_repo,
        transaction_repo=transaction_repo,
        pricing_service=pricing_service,
        uow=uow,
        config=config
    )
```

#### Step 3.8: Register Market Router
**File:** `main.py` (update)
```python
from features.market.presentation.routers.market_router import router as market_router

# In create_app():
app.include_router(market_router)
```

**Status:** Market feature complete when:
- ✅ All 8 use cases implemented
- ✅ All domain services created
- ✅ All repositories implement interfaces
- ✅ Router uses dependency injection
- ✅ Old `market_controller.py` deleted
- ✅ Tests pass

---

### **Phase 4: Migrate Teams Feature** 
**Goal:** Extract team management from `user_teams_controller_new.py`

**Files to Create:**
```
features/teams/
├── domain/
│   ├── entities/
│   │   ├── user_team.py
│   │   └── lineup.py
│   ├── value_objects/
│   │   └── budget.py
│   ├── services/
│   │   ├── team_builder_service.py
│   │   ├── budget_calculator.py
│   │   └── lineup_validator.py
│   └── interfaces/
│       └── i_team_repository.py
├── application/
│   └── use_cases/
│       ├── create_team_use_case.py
│       ├── update_lineup_use_case.py
│       └── swap_reserve_use_case.py
├── infrastructure/
│   ├── models/
│   │   └── user_team_model.py
│   └── persistence/
│       └── team_repository.py
└── presentation/
    └── routers/
        └── teams_router.py
```

**Migration Steps:**
1. Extract budget calculation logic → `budget_calculator.py`
2. Extract lineup validation → `lineup_validator.py`
3. Create use cases for each operation
4. Implement repository
5. Update router to use use cases
6. Delete `user_teams_controller_new.py`

---

### **Phase 5: Migrate Drivers Feature**
**Goal:** Extract driver data management from `drivers_controller.py`

**Key Components:**
- Driver data ingestion from FastF1
- Statistics calculation
- Tier classification (move from market)
- Driver enrichment logic

**Files to Create:**
```
features/drivers/
├── domain/
│   ├── entities/
│   │   ├── driver.py
│   │   └── driver_performance.py
│   ├── services/
│   │   ├── stats_calculator.py
│   │   └── driver_enrichment_service.py
│   └── interfaces/
│       └── i_driver_repository.py
├── application/
│   └── use_cases/
│       ├── get_drivers_with_stats_use_case.py
│       └── sync_driver_data_use_case.py
├── infrastructure/
│   ├── models/
│   │   └── driver_model.py
│   ├── persistence/
│   │   └── driver_repository.py
│   └── external/
│       └── fastf1_adapter.py
└── presentation/
    └── routers/
        └── drivers_router.py
```

---

### **Phase 6: Migrate Leagues Feature**
**Goal:** Extract league management from `league_controller.py`

**Files to Create:**
```
features/leagues/
├── domain/
│   ├── entities/
│   │   ├── league.py
│   │   └── league_participant.py
│   ├── services/
│   │   ├── join_code_generator.py
│   │   └── league_validator.py
│   └── interfaces/
│       └── i_league_repository.py
├── application/
│   └── use_cases/
│       ├── create_league_use_case.py
│       ├── join_league_use_case.py
│       └── leave_league_use_case.py
├── infrastructure/
│   └── persistence/
│       └── league_repository.py
└── presentation/
    └── routers/
        └── leagues_router.py
```

---

### **Phase 7: Migrate F1 Data Feature**
**Goal:** Extract F1 data ingestion (events, sessions, results)

**Files to Create:**
```
features/f1_data/
├── domain/
│   ├── entities/
│   │   ├── event.py
│   │   ├── session.py
│   │   └── session_result.py
│   └── services/
│       └── data_sync_service.py
├── application/
│   └── use_cases/
│       ├── sync_season_data_use_case.py
│       └── sync_session_results_use_case.py
├── infrastructure/
│   ├── external/
│   │   ├── fastf1_client.py
│   │   └── fastf1_cache_manager.py
│   └── persistence/
│       ├── events_repository.py
│       └── sessions_repository.py
└── presentation/
    └── routers/
        └── admin_router.py  # For data sync endpoints
```

---

## 📈 Migration Checklist

### **Phase 1: Foundation** ⬜
- [ ] Create directory structure (all features)
- [ ] Create shared interfaces (IRepository, IUnitOfWork)
- [ ] Create shared base classes (BaseRepository, UnitOfWork)
- [ ] Create shared exceptions
- [ ] Create shared configuration classes
- [ ] Add `__init__.py` to all directories

### **Phase 2: Pricing Service** ⬜
- [ ] Create DriverStats value object
- [ ] Create FantasyPrice value object
- [ ] Create IPricingStrategy interface
- [ ] Create StandardPricingStrategy
- [ ] Create PricingService
- [ ] Update market_controller.py to use service
- [ ] Update driver_ownership_controller.py to use service
- [ ] Update user_teams_controller_new.py to use service
- [ ] Test pricing calculations are identical
- [ ] Delete duplicated formula code

### **Phase 3: Market Feature** ⬜
- [ ] Create domain entities (DriverOwnership, MarketTransaction)
- [ ] Create value objects (ListingPrice, BuyoutTerms)
- [ ] Create domain services (BuyoutValidator, TierClassifier)
- [ ] Create repository interfaces
- [ ] Create use case: BuyDriverUseCase
- [ ] Create use case: SellToMarketUseCase
- [ ] Create use case: ListForSaleUseCase
- [ ] Create use case: UnlistDriverUseCase
- [ ] Create use case: ExecuteBuyoutUseCase
- [ ] Create use case: InitializeTeamDriversUseCase
- [ ] Create use case: GetFreeDriversUseCase
- [ ] Create use case: GetDriversForSaleUseCase
- [ ] Create infrastructure models
- [ ] Create repository implementations
- [ ] Create market router with dependency injection
- [ ] Test all market operations work
- [ ] Delete old market_controller.py
- [ ] Delete old driver_ownership_controller.py

### **Phase 4: Teams Feature** ⬜
- [ ] Create domain entities (UserTeam, Lineup)
- [ ] Create value objects (Budget)
- [ ] Create domain services (TeamBuilder, BudgetCalculator, LineupValidator)
- [ ] Create repository interface
- [ ] Create use cases (Create, Update, SwapReserve)
- [ ] Create repository implementation
- [ ] Create teams router
- [ ] Test team operations work
- [ ] Delete user_teams_controller_new.py

### **Phase 5: Drivers Feature** ⬜
- [ ] Create domain entities
- [ ] Create services (StatsCalculator, EnrichmentService)
- [ ] Create use cases
- [ ] Create FastF1Adapter
- [ ] Create repository
- [ ] Create router
- [ ] Delete drivers_controller.py

### **Phase 6: Leagues Feature** ⬜
- [ ] Create domain entities
- [ ] Create services (JoinCodeGenerator, Validator)
- [ ] Create use cases
- [ ] Create repository
- [ ] Create router
- [ ] Delete league_controller.py

### **Phase 7: F1 Data Feature** ⬜
- [ ] Create domain entities
- [ ] Create data sync service
- [ ] Create use cases
- [ ] Move FastF1Client to infrastructure
- [ ] Create repositories
- [ ] Update admin router
- [ ] Delete old data controllers

### **Phase 8: Cleanup** ⬜
- [ ] Delete controllers/ directory
- [ ] Move models/ contents to feature infrastructure
- [ ] Update all imports in routers
- [ ] Update main.py to register all feature routers
- [ ] Run all tests
- [ ] Update documentation
- [ ] Code review

---

## 🧪 Testing Strategy

### **Unit Tests**
- Domain entities (validation, business rules)
- Domain services (pure logic, no dependencies)
- Value objects (immutability, validation)

### **Integration Tests**
- Use cases (with real repositories, test database)
- Repositories (database operations)

### **E2E Tests**
- Full workflows through routers
- Market operations (buy → sell → buyout)
- Team management (create → update → swap)

---

## 🎓 Key Principles to Follow

1. **Domain Layer = Pure Python**
   - No SQLModel, no FastAPI, no database imports
   - Only business logic and domain concepts
   - Fully testable without infrastructure

2. **Dependencies Point Inward**
   - Infrastructure depends on domain interfaces
   - Application depends on domain
   - Domain depends on nothing

3. **One Use Case = One Operation**
   - Small, focused, single responsibility
   - Easy to understand, test, maintain

4. **Repositories Hide Data Access**
   - Domain entities in, domain entities out
   - No SQLModel leaking to domain layer

5. **Dependency Injection Everywhere**
   - No `self.repo = Repository()` in constructors
   - Use FastAPI Depends() for all dependencies

---

## 📚 Resources

- **Clean Architecture:** Robert C. Martin
- **Domain-Driven Design:** Eric Evans
- **SOLID Principles:** Uncle Bob
- **Feature Slices:** Jimmy Bogard (Vertical Slice Architecture)

---

## ⚠️ Important Notes

1. **This is a LARGE refactoring** - expect 2-4 weeks of focused work
2. **Do NOT refactor everything at once** - follow phases sequentially
3. **Keep old code working** - migrate feature by feature, test before deleting
4. **Write tests first** - ensure old behavior is preserved
5. **Pricing service is the proof of concept** - if Phase 2 works smoothly, rest will follow

---

## 🚀 Getting Started

**To begin migration:**
```bash
# 1. Create a feature branch
git checkout -b refactor/feature-architecture

# 2. Start with Phase 1 - create directory structure
mkdir -p features/market/domain/{entities,value_objects,services,interfaces}
# ... (continue with all directories)

# 3. Move to Phase 2 - extract pricing service
# Create the smallest working vertical slice to prove architecture

# 4. Test thoroughly before moving to next phase

# 5. Commit frequently with descriptive messages
git commit -m "feat(market): create pricing service (Phase 2.1-2.3)"
```

**Success Criteria:**
- ✅ All tests pass
- ✅ Old controllers deleted
- ✅ Clean dependency graph (no circular imports)
- ✅ Easy to add new features (e.g., new pricing strategy)
- ✅ Fast to locate code ("Where's buyout logic?" → `features/market/domain/services/buyout_validator.py`)

---

**Last Updated:** October 23, 2025  
**Status:** Ready to begin Phase 1  
**Estimated Completion:** 3-4 weeks with dedicated focus
