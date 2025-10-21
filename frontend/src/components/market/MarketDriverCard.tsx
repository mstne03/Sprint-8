import type { DriverWithOwnership } from '@/types/marketTypes';
import { motion } from 'framer-motion';
import { OwnershipBadge } from './OwnershipBadge';
import { LockCountdown } from './LockCountdown';
import { PriceDisplay } from './PriceDisplay';
import { useState } from 'react';

interface MarketDriverCardProps {
  driver: DriverWithOwnership;
  currentUserId: number;
  userBudget: number;
  userDriverCount: number;
  onBuyFromMarket?: (driverId: number) => void;
  onBuyFromUser?: (driverId: number) => void;
  onSell?: (driverId: number) => void;
  onList?: (driverId: number) => void;
  onUnlist?: (driverId: number) => void;
  onBuyout?: (driverId: number) => void;
  onViewDetails?: (driver: DriverWithOwnership) => void;
  loading?: boolean;
}

export const MarketDriverCard = ({
  driver,
  currentUserId,
  userBudget,
  userDriverCount,
  onBuyFromMarket,
  onBuyFromUser,
  onSell,
  onList,
  onUnlist,
  onBuyout,
  onViewDetails,
  loading = false,
}: MarketDriverCardProps) => {
  const [showSellMenu, setShowSellMenu] = useState(false);

  const ownership = driver.ownership;
  const isOwnedByMe = ownership?.owner_id === currentUserId;
  const isOwnedByOther = ownership?.owner_id && ownership.owner_id !== currentUserId;
  const isFreeAgent = !ownership || ownership.owner_id === null;
  const isLocked = ownership?.locked_until && new Date(ownership.locked_until) > new Date();
  const isForSale = ownership?.is_listed_for_sale;

  // Calculate prices
  const basePrice = driver.base_price || driver.fantasy_stats?.price || 0;
  const acquisitionPrice = ownership?.acquisition_price || basePrice;
  const buyoutPrice = Math.round(acquisitionPrice * 1.3);
  const refundPrice = Math.round(acquisitionPrice * 0.8);

  // Can afford check
  const canAfford = userBudget >= basePrice;
  const canAffordBuyout = userBudget >= buyoutPrice;
  const hasSpace = userDriverCount < 4;

  // Action button logic
  const getActionButton = () => {
    // Free agent
    if (isFreeAgent) {
      const canBuy = canAfford && hasSpace;
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (canBuy) onBuyFromMarket?.(driver.id);
          }}
          disabled={!canBuy || loading}
          className={`w-full px-3 py-2 rounded-lg font-medium text-sm transition-all ${
            canBuy
              ? 'bg-green-600 hover:bg-green-700 text-white hover:cursor-pointer'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {!hasSpace ? '4/4 Drivers' : !canAfford ? 'Not enough $' : loading ? 'Buying...' : 'Buy'}
        </button>
      );
    }

    // Owned by me
    if (isOwnedByMe) {
      if (isForSale) {
        return (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUnlist?.(driver.id);
            }}
            disabled={loading}
            className="w-full px-3 py-2 rounded-lg font-medium text-sm bg-gray-600 hover:bg-gray-700 text-white transition-all"
          >
            {loading ? 'Unlisting...' : 'Unlist'}
          </button>
        );
      }

      return (
        <div className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowSellMenu(!showSellMenu);
            }}
            disabled={loading}
            className="hover:cursor-pointer w-full px-3 py-2 rounded-lg font-medium text-sm bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-1"
          >
            Sell Options
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {showSellMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-10 overflow-hidden">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSellMenu(false);
                  onSell?.(driver.id);
                }}
                className="w-full px-3 py-2 text-left text-sm text-white hover:bg-red-600/50 transition-colors flex items-center gap-2"
              >
                <span>💸</span>
                <div>
                  <div className="font-medium">Quick Sell</div>
                  <div className="text-xs text-gray-400">80% refund (${(refundPrice / 1_000_000).toFixed(1)}M)</div>
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSellMenu(false);
                  onList?.(driver.id);
                }}
                className="w-full px-3 py-2 text-left text-sm text-white hover:bg-yellow-600/50 transition-colors flex items-center gap-2 border-t border-gray-700"
              >
                <span>💰</span>
                <div>
                  <div className="font-medium">List for Sale</div>
                  <div className="text-xs text-gray-400">Set custom price</div>
                </div>
              </button>
            </div>
          )}
        </div>
      );
    }

    // Owned by other - for sale
    if (isOwnedByOther && isForSale) {
      const canBuy = canAfford && hasSpace;
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (canBuy) onBuyFromUser?.(driver.id);
          }}
          disabled={!canBuy || loading}
          className={`w-full px-3 py-2 rounded-lg font-medium text-sm transition-all ${
            canBuy
              ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          {!hasSpace ? '4/4 Drivers' : !canAfford ? 'Not enough $' : loading ? 'Buying...' : 'Buy Listed'}
        </button>
      );
    }

    // Owned by other - not locked (can buyout)
    if (isOwnedByOther && !isLocked) {
      const canBuy = canAffordBuyout && hasSpace;
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (canBuy) onBuyout?.(driver.id);
          }}
          disabled={!canBuy || loading}
          className={`w-full px-3 py-2 rounded-lg font-medium text-sm transition-all flex items-center justify-center gap-1 ${
            canBuy
              ? 'bg-orange-600 hover:bg-orange-700 text-white'
              : 'bg-gray-600 text-gray-400 cursor-not-allowed'
          }`}
        >
          <span>🔥</span>
          {!hasSpace ? '4/4 Drivers' : !canAffordBuyout ? 'Not enough $' : loading ? 'Buying out...' : 'Buyout'}
        </button>
      );
    }

    // Locked by other user
    return (
      <div className="w-full px-3 py-2 rounded-lg font-medium text-sm bg-gray-700 text-gray-400 text-center cursor-not-allowed">
        Locked
      </div>
    );
  };

  return (
    <motion.div
      key={driver.id}
      className="p-4 rounded-lg border backdrop-blur-[10px] cursor-default"
      style={{
        borderColor: `${driver.driver_color}60`,
        backgroundColor: `${driver.driver_color}20`,
      }}
      whileHover={{
        borderColor: `${driver.driver_color}`,
        backgroundColor: `${driver.driver_color}30`,
        scale: 1.02,
      }}
      transition={{
        duration: 0.15,
        ease: 'easeOut',
      }}
    >
      {/* Header with photo, name, and badges */}
      <div className="flex items-start gap-3 mb-3">
        <img
          src={driver.headshot_url}
          alt={driver.full_name}
          className="w-12 h-12 rounded-full object-cover object-top"
        />
        <div className="text-[70%] flex-1 min-w-0">
          <p className="text-white font-medium truncate">{driver.full_name}</p>
          <p className="text-gray-100 text-sm truncate">{driver.team_name}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            <OwnershipBadge
              ownership={ownership}
              currentUserId={currentUserId}
              compact
            />
            {isLocked && <LockCountdown lockedUntil={ownership.locked_until} compact />}
          </div>
        </div>
        <div
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.(driver);
          }}
          className="p-2 rounded-lg bg-gray-700/60 hover:bg-gray-500/80 border border-gray-600/40 hover:border-gray-400/60 transition-all duration-150 cursor-pointer group shadow-lg hover:shadow-xl flex-shrink-0"
        >
          <svg
            className="w-5 h-5 text-gray-200 group-hover:text-white transition-colors"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-2 text-xs mb-3">
        <div className="text-center p-2 bg-gray-100/30 rounded">
          <p className="text-gray-100">Points</p>
          <p className="text-white font-bold">{driver.season_results?.points || 0}</p>
        </div>
        <div className="text-center p-2 bg-gray-100/30 rounded">
          <p className="text-gray-100">Avg Finish</p>
          <p className="text-white font-bold">{driver.fantasy_stats?.avg_finish?.toFixed(1) || 'N/A'}</p>
        </div>
        <PriceDisplay
          price={isOwnedByOther && !isLocked ? buyoutPrice : basePrice}
          type={isOwnedByOther && !isLocked ? 'buyout' : 'base'}
          showIcon={false}
        />
      </div>

      {/* Action button */}
      {getActionButton()}
    </motion.div>
  );
};
