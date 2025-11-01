import { DndContext, closestCenter, useSensors } from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { MarketDriverList } from '@/features/Market/components';
import type { DriverWithOwnership } from '@/features/Market/types/marketTypes';
import type { ActiveTab } from '../../hooks/useMarketState';

export interface MarketDriverSectionProps {
    activeTab: ActiveTab | null;
    filteredDrivers: DriverWithOwnership[];
    searchQuery: string;
    loading: boolean;
    currentUserId: number;
    userBudget: number;
    userDriverCount: number;
    reserveDriverId?: number | null;
    swappingDriverIds: { mainDriver: number; reserve: number } | null;
    sensors: ReturnType<typeof useSensors>;
    onDragEnd: (event: DragEndEvent) => void;
    handlers: {
        handleBuyFromMarket: (driverId: number) => void;
        handleBuyFromUser: (driverId: number) => void;
        handleSell: (driverId: number) => void;
        handleList: (driverId: number) => void;
        handleUnlist: (driverId: number) => void;
        handleBuyout: (driverId: number) => void;
    };
    onViewDetails: (driver: DriverWithOwnership | null) => void;
}

const MarketDriverSection = ({
    activeTab,
    filteredDrivers,
    searchQuery,
    loading,
    currentUserId,
    userBudget,
    userDriverCount,
    reserveDriverId,
    swappingDriverIds,
    sensors,
    onDragEnd,
    handlers,
    onViewDetails,
}: MarketDriverSectionProps) => {
    // Compute title based on active tab
    const title = {
        'free': 'Free Agent Drivers',
        'for-sale': 'Drivers For Sale',
        'my-drivers': 'My Drivers',
    }[activeTab?? 'free'];

    // Compute empty message based on tab and search
    const getEmptyMessage = () => {
        if (searchQuery) return "No drivers match your search";
        
        if (activeTab === 'my-drivers') return "You don't own any drivers yet";
        if (activeTab === 'free') return "No free agents available";
        return "No drivers for sale available";
    };

    // Common MarketDriverList props
    const commonProps = {
        drivers: filteredDrivers,
        loading,
        currentUserId,
        userBudget,
        userDriverCount,
        reserveDriverId,
        onBuyFromMarket: handlers.handleBuyFromMarket,
        onBuyFromUser: handlers.handleBuyFromUser,
        onSell: handlers.handleSell,
        onList: handlers.handleList,
        onUnlist: handlers.handleUnlist,
        onBuyout: handlers.handleBuyout,
        onViewDetails,
        emptyMessage: getEmptyMessage(),
        gridColumns: 4 as const,
    };

    return (
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white">
                    {title}
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm lg:text-base">
                    {filteredDrivers.length} {filteredDrivers.length === 1 ? 'driver' : 'drivers'}
                </p>
            </div>

            {/* Driver List - with or without DnD */}
            {activeTab === 'my-drivers' ? (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={onDragEnd}
                >
                    <SortableContext
                        items={filteredDrivers.map(d => `driver-${d.id}`)}
                    >
                        <MarketDriverList
                            {...commonProps}
                            enableDragDrop={true}
                            swappingDriverIds={swappingDriverIds}
                        />
                    </SortableContext>
                </DndContext>
            ) : (
                <MarketDriverList {...commonProps} />
            )}
        </div>
    );
};

export default MarketDriverSection;
