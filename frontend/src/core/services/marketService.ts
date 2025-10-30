/**
 * Market Service - API client for driver ownership and market transactions
 */
import { http } from '../config/axios';
import type {
  DriverOwnership,
  MarketTransaction,
  BuyoutClauseHistory,
  BuyDriverFromMarketRequest,
  BuyDriverResponse,
  BuyDriverFromUserRequest,
  BuyFromUserResponse,
  SellDriverToMarketRequest,
  SellDriverResponse,
  ListDriverForSaleRequest,
  ListDriverResponse,
  UnlistDriverRequest,
  BuyoutClauseRequest,
  BuyoutClauseResponse,
  DriverWithOwnership,
} from '@/features/Market/types/marketTypes';

class MarketService {
  /**
   * Get all driver ownerships for a league
   */
  async getDriverOwnerships(leagueId: number): Promise<DriverOwnership[]> {
    const response = await http.get<DriverOwnership[]>(
      `/leagues/${leagueId}/driver-ownership`
    );
    return response.data;
  }

  /**
   * Get ownership information for a specific driver in a league
   */
  async getDriverOwnership(
    leagueId: number,
    driverId: number
  ): Promise<DriverOwnership> {
    const response = await http.get<DriverOwnership>(
      `/leagues/${leagueId}/driver-ownership/${driverId}`
    );
    return response.data;
  }

  /**
   * Get all free (unowned) drivers with their details
   */
  async getFreeDrivers(leagueId: number): Promise<DriverWithOwnership[]> {
    const response = await http.get<DriverWithOwnership[]>(
      `/leagues/${leagueId}/market/free-drivers`
    );
    return response.data;
  }

  /**
   * Get all drivers that are listed for sale
   */
  async getDriversForSale(leagueId: number): Promise<DriverWithOwnership[]> {
    const response = await http.get<DriverWithOwnership[]>(
      `/leagues/${leagueId}/market/for-sale`
    );
    return response.data;
  }

  /**
   * Get all drivers owned by a specific user
   */
  async getUserDrivers(
    leagueId: number,
    userId: number | string  // Accept both internal ID and Supabase UUID
  ): Promise<DriverWithOwnership[]> {
    const response = await http.get<DriverWithOwnership[]>(
      `/leagues/${leagueId}/market/user-drivers/${userId}`
    );
    return response.data;
  }

  /**
   * Buy a driver from the market (free agents)
   */
  async buyDriverFromMarket(
    leagueId: number,
    driverId: number,
    request: BuyDriverFromMarketRequest
  ): Promise<BuyDriverResponse> {
    const response = await http.post<BuyDriverResponse>(
      `/leagues/${leagueId}/market/buy-from-market/${driverId}`,
      request
    );
    return response.data;
  }

  /**
   * Buy a driver from another user (listed for sale or buyout)
   */
  async buyDriverFromUser(
    leagueId: number,
    driverId: number,
    request: BuyDriverFromUserRequest
  ): Promise<BuyFromUserResponse> {
    const response = await http.post<BuyFromUserResponse>(
      `/leagues/${leagueId}/market/buy-from-user/${driverId}`,
      request
    );
    return response.data;
  }

  /**
   * Sell a driver back to the market
   */
  async sellDriverToMarket(
    leagueId: number,
    driverId: number,
    request: SellDriverToMarketRequest
  ): Promise<SellDriverResponse> {
    const response = await http.post<SellDriverResponse>(
      `/leagues/${leagueId}/market/sell-to-market/${driverId}`,
      request
    );
    return response.data;
  }

  /**
   * List a driver for sale to other users
   */
  async listDriverForSale(
    leagueId: number,
    driverId: number,
    request: ListDriverForSaleRequest
  ): Promise<ListDriverResponse> {
    const response = await http.post<ListDriverResponse>(
      `/leagues/${leagueId}/market/list-for-sale/${driverId}`,
      request
    );
    return response.data;
  }

  /**
   * Unlist a driver from sale
   */
  async unlistDriverFromSale(
    leagueId: number,
    driverId: number,
    request: UnlistDriverRequest
  ): Promise<ListDriverResponse> {
    const response = await http.delete<ListDriverResponse>(
      `/leagues/${leagueId}/market/list-for-sale/${driverId}`,
      { data: request }
    );
    return response.data;
  }

  /**
   * Execute a buyout clause on another user's driver
   */
  async executeBuyoutClause(
    leagueId: number,
    driverId: number,
    request: BuyoutClauseRequest
  ): Promise<BuyoutClauseResponse> {
    const response = await http.post<BuyoutClauseResponse>(
      `/leagues/${leagueId}/market/buyout-clause/${driverId}`,
      request
    );
    return response.data;
  }

  /**
   * Get market transactions for a league
   */
  async getMarketTransactions(leagueId: number): Promise<MarketTransaction[]> {
    const response = await http.get<MarketTransaction[]>(
      `/leagues/${leagueId}/market/transactions`
    );
    return response.data;
  }

  /**
   * Get buyout clause history for a league
   */
  async getBuyoutHistory(leagueId: number): Promise<BuyoutClauseHistory[]> {
    const response = await http.get<BuyoutClauseHistory[]>(
      `/leagues/${leagueId}/market/buyout-history`
    );
    return response.data;
  }
}

export const marketService = new MarketService();
