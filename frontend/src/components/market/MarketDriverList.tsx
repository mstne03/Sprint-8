import { motion, AnimatePresence } from 'framer-motion';
import type { DriverWithOwnership } from '@/types/marketTypes';
import { MarketDriverCard } from './MarketDriverCard';

interface MarketDriverListProps {
  drivers: DriverWithOwnership[];
  loading: boolean;
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
  emptyMessage?: string;
  gridColumns?: 2 | 3 | 4;
}

export const MarketDriverList = ({
  drivers,
  loading,
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
  emptyMessage = 'No drivers found',
  gridColumns = 4,
}: MarketDriverListProps) => {
  // Loading skeletons
  if (loading) {
    return (
      <div className={`grid gap-4 ${
        gridColumns === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' :
        gridColumns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
        'grid-cols-1 md:grid-cols-2'
      }`}>
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-lg border border-gray-700 bg-gray-800/50 animate-pulse"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gray-700" />
              <div className="flex-1">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2" />
                <div className="h-3 bg-gray-700 rounded w-1/2" />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
              <div className="h-12 bg-gray-700 rounded" />
              <div className="h-12 bg-gray-700 rounded" />
              <div className="h-12 bg-gray-700 rounded" />
            </div>
            <div className="h-10 bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    );
  }

  // Empty state
  if (drivers.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="w-16 h-16 text-gray-600 mx-auto mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
          />
        </svg>
        <h3 className="text-gray-400 text-xl font-semibold mb-2">No Drivers Found</h3>
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  // Driver grid
  return (
    <div className={`grid gap-4 ${
      gridColumns === 4 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' :
      gridColumns === 3 ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' :
      'grid-cols-1 md:grid-cols-2'
    }`}>
      <AnimatePresence mode="popLayout">
        {drivers.map((driver) => (
          <motion.div
            key={driver.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            <MarketDriverCard
              driver={driver}
              currentUserId={currentUserId}
              userBudget={userBudget}
              userDriverCount={userDriverCount}
              onBuyFromMarket={onBuyFromMarket}
              onBuyFromUser={onBuyFromUser}
              onSell={onSell}
              onList={onList}
              onUnlist={onUnlist}
              onBuyout={onBuyout}
              onViewDetails={onViewDetails}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
