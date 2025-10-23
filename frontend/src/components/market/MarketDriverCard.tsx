import type { MarketDriverCardProps } from '@/types/marketTypes';
import { motion } from 'framer-motion';
import { OwnershipBadge } from './OwnershipBadge';
import { LockCountdown } from './LockCountdown';
import { PriceDisplay } from './PriceDisplay';
import { useState } from 'react';
import { useDriverActionButton } from '@/hooks/market';
import { calculateDriverPricing } from '@/utils/driverPricing';
import { determineDriverAction } from '@/utils/driverActions';

export const MarketDriverCard = ({
  driver,
  currentUserId,
  userBudget,
  userDriverCount,
  reserveDriverId,
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

  // Pure function: Calculate pricing and ownership data
  const pricing = calculateDriverPricing(driver, currentUserId);
  
  // Pure function: Determine action button type and state
  const actions = determineDriverAction(pricing, userBudget, userDriverCount);
  
  // Extract commonly used values
  const { basePrice, displayPrice, buyoutPrice, isFreeAgent, isOwnedByMe, isOwnedByOther, isLocked, isForSale } = pricing;
  const ownership = driver.ownership;
  const isReserve = isOwnedByMe && reserveDriverId === driver.id;

  // Hook: Render action button (JSX)
  const { renderActionButton } = useDriverActionButton({
    pricing,
    actions,
    loading,
    driverId: driver.id,
    showSellMenu,
    setShowSellMenu,
    onBuyFromMarket,
    onBuyFromUser,
    onSell,
    onList,
    onUnlist,
    onBuyout,
  });

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
              isReserve={isReserve}
              compact
            />
            {isLocked && ownership?.locked_until && <LockCountdown lockedUntil={ownership.locked_until} compact />}
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
          <p className="text-white font-bold">{driver.fantasy_stats?.avg_finish?.toLocaleString(undefined, { maximumFractionDigits: 1, useGrouping: false }) || 'N/A'}</p>
        </div>
        <PriceDisplay
          price={
            isFreeAgent ? basePrice :
            isForSale ? displayPrice :
            isOwnedByOther && !isLocked ? buyoutPrice :
            displayPrice
          }
          type={
            isFreeAgent ? 'base' :
            isForSale ? 'sale' :
            isOwnedByOther && !isLocked ? 'buyout' :
            'base'
          }
          showIcon={false}
        />
      </div>

      {/* Action button */}
      {renderActionButton()}
    </motion.div>
  );
};
