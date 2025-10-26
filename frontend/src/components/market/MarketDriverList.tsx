import { motion, AnimatePresence } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { MarketDriverListProps } from '@/types/marketTypes';
import { MarketDriverCard } from './MarketDriverCard';
import { ReserveDriverSlot } from './ReserveDriverSlot';

export const MarketDriverList = ({
  drivers,
  loading,
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
  emptyMessage = 'No drivers found',
  gridColumns = 4,
  enableDragDrop = false,
  swappingDriverIds,
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
  // Special layout when drag & drop is enabled (My Drivers tab)
  if (enableDragDrop) {
    const mainDrivers = drivers.filter(d => d.id !== reserveDriverId);
    const reserveDriver = drivers.find(d => d.id === reserveDriverId);

    // Skeleton component for swapping state
    const DriverSkeleton = () => (
      <div className="p-4 rounded-lg border border-blue-500 bg-gray-800/50 animate-pulse">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full bg-blue-500/30" />
          <div className="flex-1">
            <div className="h-4 bg-blue-500/30 rounded w-3/4 mb-2" />
            <div className="h-3 bg-blue-500/30 rounded w-1/2" />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mb-3">
          <div className="h-12 bg-blue-500/20 rounded" />
          <div className="h-12 bg-blue-500/20 rounded" />
          <div className="h-12 bg-blue-500/20 rounded" />
        </div>
        <div className="h-10 bg-blue-500/20 rounded" />
        <div className="text-center mt-2 text-xs text-blue-400">
          Swapping drivers...
        </div>
      </div>
    );

    const DraggableCard = ({ driver }: { driver: typeof drivers[0] }) => {
      const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
      } = useSortable({ 
        id: `driver-${driver.id}`,
        transition: null, // Disable automatic transitions
      });

      // Check if this driver is being swapped
      const isSwapping = swappingDriverIds && 
        (swappingDriverIds.mainDriver === driver.id || swappingDriverIds.reserve === driver.id);

      // Only apply transform to the card being dragged, not to other cards
      const style = {
        transform: isDragging ? CSS.Transform.toString(transform) : undefined,
        transition: isDragging ? transition : undefined,
        opacity: isDragging ? 0.5 : 1,
      };

      // Show skeleton if swapping
      if (isSwapping) {
        return <DriverSkeleton />;
      }

      return (
        <div>
          <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className="touch-none cursor-grab active:cursor-grabbing"
          >
            <MarketDriverCard
              driver={driver}
              currentUserId={currentUserId}
              userBudget={userBudget}
              userDriverCount={userDriverCount}
              reserveDriverId={reserveDriverId}
              onBuyFromMarket={onBuyFromMarket}
              onBuyFromUser={onBuyFromUser}
              onSell={onSell}
              onList={onList}
              onUnlist={onUnlist}
              onBuyout={onBuyout}
              onViewDetails={onViewDetails}
            />
          </div>
        </div>
      );
    };

    const DraggableReserveSlot = () => {
      const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
      } = useSortable({ 
        id: reserveDriver ? `driver-${reserveDriver.id}` : 'reserve-empty',
        transition: null, // Disable automatic transitions
      });

      // Only apply transform to the card being dragged
      const dragStyle = {
        transform: isDragging ? CSS.Transform.toString(transform) : undefined,
        transition: isDragging ? transition : undefined,
      };

      // Check if reserve driver is being swapped
      const isSwapping = swappingDriverIds && reserveDriver &&
        (swappingDriverIds.mainDriver === reserveDriver.id || swappingDriverIds.reserve === reserveDriver.id);

      return (
        <ReserveDriverSlot
          driver={reserveDriver || null}
          isEmpty={!reserveDriver}
          currentUserId={currentUserId}
          userBudget={userBudget}
          userDriverCount={userDriverCount}
          reserveDriverId={reserveDriverId}
          onBuyFromMarket={onBuyFromMarket}
          onBuyFromUser={onBuyFromUser}
          onSell={onSell}
          onList={onList}
          onUnlist={onUnlist}
          onBuyout={onBuyout}
          onViewDetails={onViewDetails}
          dragRef={reserveDriver ? setNodeRef : undefined}
          dragStyle={reserveDriver ? dragStyle : undefined}
          dragAttributes={reserveDriver ? attributes : undefined}
          dragListeners={reserveDriver ? listeners : undefined}
          isDragging={isDragging}
          isSwapping={isSwapping ?? undefined}
        />
      );
    };

    return (
      <div>
        {/* Main Drivers Section */}
        <div>
          <h3 className="text-gray-300 font-semibold mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
              <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
            </svg>
            Main Lineup
          </h3>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {mainDrivers.map((driver) => (
                <motion.div
                  key={driver.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <DraggableCard driver={driver} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Reserve Driver Section */}
        <DraggableReserveSlot />
      </div>
    );
  }

  // Standard grid layout (for other tabs)
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
              reserveDriverId={reserveDriverId}
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
