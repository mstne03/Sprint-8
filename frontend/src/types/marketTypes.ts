/**
 * Market and ownership related types
 */

export interface DriverOwnership {
  driver_id: number;
  league_id: number;
  owner_id: number | null; // null = free agent
  is_listed_for_sale: boolean;
  acquisition_price: number;
  locked_until: string | null; // ISO datetime string
  created_at: string;
  updated_at: string;
}

export interface MarketTransaction {
  id: number;
  driver_id: number;
  league_id: number;
  seller_id: number | null; // null for free agent purchases
  buyer_id: number;
  transaction_price: number;
  transaction_type: 'buy_from_market' | 'buy_from_user' | 'sell_to_market' | 'buyout_clause' | 'emergency_assignment';
  transaction_date: string;
}

export interface BuyoutClauseHistory {
  id: number;
  league_id: number;
  buyer_id: number;
  victim_id: number;
  driver_id: number;
  buyout_price: number;
  buyout_date: string;
  season_year: number;
}

// Request types
export interface BuyDriverFromMarketRequest {
  buyer_user_id: number;
}

export interface BuyDriverFromUserRequest {
  buyer_user_id: number;
  seller_user_id: number;
}

export interface SellDriverToMarketRequest {
  seller_user_id: number;
}

export interface ListDriverForSaleRequest {
  owner_user_id: number;
  asking_price?: number;
}

export interface UnlistDriverRequest {
  owner_user_id: number;
}

export interface BuyoutClauseRequest {
  buyer_user_id: number;
  victim_user_id: number;
}

// Response types
export interface BuyDriverResponse {
  success: boolean;
  driver_id: number;
  price: number;
  locked_until: string;
  new_budget: number;
}

export interface BuyFromUserResponse {
  success: boolean;
  driver_id: number;
  price: number;
  seller_id: number;
  locked_until: string;
  buyer_new_budget: number;
  seller_new_budget: number;
}

export interface SellDriverResponse {
  success: boolean;
  driver_id: number;
  refund: number;
  new_budget: number;
}

export interface ListDriverResponse {
  success: boolean;
  driver_id: number;
  asking_price: number;
  is_listed: boolean;
}

export interface BuyoutClauseResponse {
  success: boolean;
  driver_id: number;
  buyout_price: number;
  buyer_new_budget: number;
  victim_new_budget: number;
  locked_until: string;
  replacement_info: {
    auto_replaced: boolean;
    replacement_type: 'reserve_promoted' | 'emergency_tier_c' | 'reserve_removed';
    emergency_driver_id?: number;
    message: string;
  } | null;
}

// Extended Driver type with ownership info
export interface DriverWithOwnership {
  // Driver base info
  id: number;
  driver_number: number;
  full_name: string;
  acronym: string;
  driver_color: string;
  country_code: string | null;
  headshot_url: string;
  base_price: number;
  team_name?: string;
  
  // Stats
  season_results?: {
    points: number;
    position: number;
  };
  fantasy_stats?: {
    price: number;
    avg_finish: number;
    total_points: number;
  };
  
  // Ownership info
  ownership: DriverOwnership | null;
  
  // Derived properties
  isOwned: boolean;
  isOwnedByMe: boolean;
  isFreeAgent: boolean;
  isForSale: boolean;
  isLocked: boolean;
  canBuyout: boolean;
  ownerName?: string;
}

// Market filters
export type MarketFilter = 'all' | 'free' | 'owned' | 'for-sale' | 'locked';

export interface MarketFilters {
  filter: MarketFilter;
  searchQuery: string;
  sortBy: 'name' | 'price' | 'points';
  sortOrder: 'asc' | 'desc';
}
