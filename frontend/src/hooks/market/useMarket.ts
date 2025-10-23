/**
 * Market API hooks for driver ownership and transactions
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { marketService } from '@/services';
import type {
  BuyDriverFromMarketRequest,
  BuyDriverFromUserRequest,
  SellDriverToMarketRequest,
  ListDriverForSaleRequest,
  UnlistDriverRequest,
  BuyoutClauseRequest,
} from '@/types/marketTypes';

/**
 * Get all driver ownerships for a league
 */
export const useDriverOwnerships = (leagueId: number) => {
  return useQuery({
    queryKey: ['driver-ownerships', leagueId],
    queryFn: () => marketService.getDriverOwnerships(leagueId),
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!leagueId,
  });
};

/**
 * Get free agent drivers in a league
 */
export const useFreeDrivers = (leagueId: number) => {
  return useQuery({
    queryKey: ['free-drivers', leagueId],
    queryFn: () => marketService.getFreeDrivers(leagueId),
    staleTime: 30 * 1000,
    enabled: !!leagueId,
  });
};

/**
 * Get drivers listed for sale in a league
 */
export const useDriversForSale = (leagueId: number) => {
  return useQuery({
    queryKey: ['drivers-for-sale', leagueId],
    queryFn: () => marketService.getDriversForSale(leagueId),
    staleTime: 30 * 1000,
    enabled: !!leagueId,
  });
};

/**
 * Get drivers owned by a specific user in a league
 */
export const useUserDrivers = (leagueId: number, userId: number | string) => {
  return useQuery({
    queryKey: ['user-drivers', leagueId, userId],
    queryFn: () => marketService.getUserDrivers(leagueId, userId),
    staleTime: 30 * 1000,
    enabled: !!leagueId && !!userId,
  });
};

/**
 * Get ownership status of a specific driver
 */
export const useDriverOwnership = (leagueId: number, driverId: number) => {
  return useQuery({
    queryKey: ['driver-ownership', leagueId, driverId],
    queryFn: () => marketService.getDriverOwnership(leagueId, driverId),
    staleTime: 30 * 1000,
    enabled: !!leagueId && !!driverId,
  });
};

/**
 * Buy a driver from the market (free agent)
 */
export const useBuyFromMarket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leagueId, driverId, request }: {
      leagueId: number;
      driverId: number;
      request: BuyDriverFromMarketRequest;
    }) => marketService.buyDriverFromMarket(leagueId, driverId, request),
    onSuccess: (_, variables) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['driver-ownerships', variables.leagueId] });
      queryClient.invalidateQueries({ queryKey: ['free-drivers', variables.leagueId] });
      queryClient.invalidateQueries({ queryKey: ['user-drivers', variables.leagueId] });
      // Invalidate user-team with partial match (includes user.id in the key)
      queryClient.invalidateQueries({ queryKey: ['user-team', variables.leagueId], exact: false });
      // Also invalidate league-detail to refresh selectedDrivers
      queryClient.invalidateQueries({ queryKey: ['league-detail', variables.leagueId], exact: false });
    },
  });
};

/**
 * Buy a driver from another user
 */
export const useBuyFromUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leagueId, driverId, request }: {
      leagueId: number;
      driverId: number;
      request: BuyDriverFromUserRequest;
    }) => marketService.buyDriverFromUser(leagueId, driverId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['driver-ownerships', variables.leagueId] });
      queryClient.invalidateQueries({ queryKey: ['drivers-for-sale', variables.leagueId] });
      queryClient.invalidateQueries({ queryKey: ['user-drivers', variables.leagueId] });
      // Invalidate user-team with partial match (includes user.id in the key)
      queryClient.invalidateQueries({ queryKey: ['user-team', variables.leagueId], exact: false });
      // Also invalidate league-detail to refresh selectedDrivers
      queryClient.invalidateQueries({ queryKey: ['league-detail', variables.leagueId], exact: false });
    },
  });
};

/**
 * Sell a driver to the market (quick sell)
 */
export const useSellToMarket = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leagueId, driverId, request }: {
      leagueId: number;
      driverId: number;
      request: SellDriverToMarketRequest;
    }) => marketService.sellDriverToMarket(leagueId, driverId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['driver-ownerships', variables.leagueId] });
      queryClient.invalidateQueries({ queryKey: ['free-drivers', variables.leagueId] });
      queryClient.invalidateQueries({ queryKey: ['user-drivers', variables.leagueId] });
      // Invalidate user-team with partial match (includes user.id in the key)
      queryClient.invalidateQueries({ queryKey: ['user-team', variables.leagueId], exact: false });
      // Also invalidate league-detail to refresh selectedDrivers
      queryClient.invalidateQueries({ queryKey: ['league-detail', variables.leagueId], exact: false });
    },
  });
};

/**
 * List a driver for sale
 */
export const useListForSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leagueId, driverId, request }: {
      leagueId: number;
      driverId: number;
      request: ListDriverForSaleRequest;
    }) => marketService.listDriverForSale(leagueId, driverId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['driver-ownerships', variables.leagueId] });
      queryClient.invalidateQueries({ queryKey: ['drivers-for-sale', variables.leagueId] });
      queryClient.invalidateQueries({ queryKey: ['user-drivers', variables.leagueId] });
    },
  });
};

/**
 * Remove a driver from sale listings
 */
export const useUnlistFromSale = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leagueId, driverId, request }: {
      leagueId: number;
      driverId: number;
      request: UnlistDriverRequest;
    }) => marketService.unlistDriverFromSale(leagueId, driverId, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['driver-ownerships', variables.leagueId] });
      queryClient.invalidateQueries({ queryKey: ['drivers-for-sale', variables.leagueId] });
      queryClient.invalidateQueries({ queryKey: ['user-drivers', variables.leagueId] });
    },
  });
};

/**
 * Execute a buyout clause
 */
export const useBuyoutClause = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ leagueId, driverId, request }: {
      leagueId: number;
      driverId: number;
      request: BuyoutClauseRequest;
    }) => marketService.executeBuyoutClause(leagueId, driverId, request),
    onSuccess: (_, variables) => {
      // Invalidate everything - buyout affects multiple users
      queryClient.invalidateQueries({ queryKey: ['driver-ownerships', variables.leagueId] });
      queryClient.invalidateQueries({ queryKey: ['user-drivers', variables.leagueId] });
      // Invalidate user-team with partial match (includes user.id in the key)
      queryClient.invalidateQueries({ queryKey: ['user-team', variables.leagueId], exact: false });
      // Also invalidate league-detail to refresh selectedDrivers
      queryClient.invalidateQueries({ queryKey: ['league-detail', variables.leagueId], exact: false });
    },
  });
};

/**
 * Get market transactions history
 */
export const useMarketTransactions = (leagueId: number) => {
  return useQuery({
    queryKey: ['market-transactions', leagueId],
    queryFn: () => marketService.getMarketTransactions(leagueId),
    enabled: !!leagueId,
  });
};

/**
 * Get buyout clause history
 */
export const useBuyoutHistory = (leagueId: number) => {
  return useQuery({
    queryKey: ['buyout-history', leagueId],
    queryFn: () => marketService.getBuyoutHistory(leagueId),
    enabled: !!leagueId,
  });
};
