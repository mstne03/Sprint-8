import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { SortableContext } from '@dnd-kit/sortable';
import { 
    DriverCardExpanded, 
    MarketDriverList, 
    DriverSaleModal,
    DriverSlotsDisplay 
} from '@/components/market';
import { SearchInput, ConfirmDialog } from '@/components/ui';
import { useLeagueDetail } from '@/hooks/leagues';
import { formatCurrencyPrecise } from '@/utils/currencyFormat';
import { 
    useFreeDrivers, 
    useDriversForSale, 
    useUserDrivers, 
    useBuyFromMarket, 
    useSellToMarket, 
    useListForSale, 
    useUnlistFromSale, 
    useBuyFromUser,
    useReserveDriverDragDrop,
    useSortedMyDrivers,
    useFilteredDrivers,
    useMarketHandlers,
} from '@/hooks/market';
import { useUserTeam } from '@/hooks/userTeams';
import type { DriverWithOwnership } from '@/types/marketTypes';

const Market = () => {
    const { leagueId } = useParams<{ leagueId: string }>();
    const navigate = useNavigate();
    const [expandedDriver, setExpandedDriver] = useState<DriverWithOwnership | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'free' | 'for-sale' | 'my-drivers'>('free');
    const [buyModalDriver, setBuyModalDriver] = useState<DriverWithOwnership | null>(null);
    const [sellModalDriver, setSellModalDriver] = useState<DriverWithOwnership | null>(null);
    const [listModalDriver, setListModalDriver] = useState<DriverWithOwnership | null>(null);
    
    // Dialog states
    const [dialog, setDialog] = useState<{
        isOpen: boolean;
        type: 'confirm' | 'success' | 'error' | 'info';
        title: string;
        message: string;
        onConfirm?: () => void;
        confirmText?: string;
    }>({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
    });

    // Fetch data
    const { league, isLoading: leagueLoading, error: leagueError } = useLeagueDetail(leagueId || '');
    const { data: freeDrivers, isLoading: freeDriversLoading } = useFreeDrivers(Number(leagueId));
    const { data: forSaleDrivers, isLoading: forSaleLoading } = useDriversForSale(Number(leagueId));
    const { data: userTeam, isLoading: teamLoading } = useUserTeam(Number(leagueId));
    
    // Get user's internal ID from team
    const internalUserId = userTeam?.user_id || 0;
    const { data: myDrivers, isLoading: myDriversLoading } = useUserDrivers(
        Number(leagueId),
        internalUserId
    );

    // Calculate user driver count from actual owned drivers
    const userDriverCount = myDrivers?.length || 0;
    const userBudget = userTeam?.budget_remaining || 0;

    // Sort drivers for "My Drivers" tab by their slot position
    const sortedMyDrivers = useSortedMyDrivers({
        myDrivers,
        userTeam,
    });

    // Mutations
    const { mutate: buyFromMarket, isPending: isBuyingFromMarket } = useBuyFromMarket();
    const { mutate: buyFromUser } = useBuyFromUser();
    const { mutate: sellToMarket, isPending: isSellingToMarket } = useSellToMarket();
    const { mutate: listForSale, isPending: isListing } = useListForSale();
    const { mutate: unlistFromSale } = useUnlistFromSale();

    // Drag & Drop for reserve driver swap
    const { sensors, swappingDriverIds, handleDragEnd } = useReserveDriverDragDrop({
        leagueId: Number(leagueId),
        userId: internalUserId,
        reserveDriverId: userTeam?.reserve_driver_id,
    });

    // Market operation handlers
    const handlers = useMarketHandlers({
        leagueId: Number(leagueId),
        internalUserId,
        freeDrivers,
        forSaleDrivers,
        myDrivers,
        userBudget,
        userDriverCount,
        buyFromMarket,
        buyFromUser,
        sellToMarket,
        listForSale,
        unlistFromSale,
        setBuyModalDriver,
        setSellModalDriver,
        setListModalDriver,
        setDialog,
        dialog,
        buyModalDriver,
        sellModalDriver,
        listModalDriver,
    });

    // Filter drivers by search query
    const filteredDrivers = useFilteredDrivers({
        freeDrivers,
        forSaleDrivers,
        sortedMyDrivers,
        activeTab,
        searchQuery,
    });

    // Loading state
    if (leagueLoading || freeDriversLoading || forSaleLoading || myDriversLoading || teamLoading) {
        return (
            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
                        <p className="text-gray-400 text-lg">
                            Loading market...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (leagueError || !league) {
        return (
            <div className="p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-red-400 text-2xl font-bold mb-2">Access Denied</h2>
                        <p className="text-gray-400 text-lg mb-4">You are not a member of this league</p>
                        <button
                            onClick={() => navigate('/leagues')}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors cursor-pointer"
                        >
                            Back to Leagues
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(`/leagues/${leagueId}`)}
                        className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors cursor-pointer"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to {league.name}
                    </button>
                    
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">
                                Driver Market
                            </h1>
                            <p className="text-gray-300 text-lg">
                                Buy, sell, and trade drivers for <span className="text-blue-400 font-medium">{league.name}</span>
                            </p>
                        </div>
                        
                        {/* Budget & Driver Count */}
                        <div className="flex gap-4">
                            <div className="bg-gradient-to-br from-green-600/20 to-green-700/20 border border-green-500/50 rounded-xl px-6 py-3">
                                <p className="text-green-300 text-sm font-medium">Budget</p>
                                <p className="text-white text-2xl font-bold">
                                    {formatCurrencyPrecise(userBudget)}
                                </p>
                            </div>
                            <DriverSlotsDisplay driverCount={userDriverCount} />
                        </div>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 backdrop-blur-sm rounded-2xl p-6 mb-8">
                    {/* Tabs */}
                    <div className="flex gap-2 mb-6 border-b border-gray-700/50">
                        <button
                            onClick={() => setActiveTab('free')}
                            className={`px-6 py-3 font-medium transition-all cursor-pointer ${
                                activeTab === 'free'
                                    ? 'text-blue-400 border-b-2 border-blue-400'
                                    : 'text-gray-400 hover:text-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                Free Agents ({freeDrivers?.length || 0})
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('for-sale')}
                            className={`px-6 py-3 font-medium transition-all cursor-pointer ${
                                activeTab === 'for-sale'
                                    ? 'text-yellow-400 border-b-2 border-yellow-400'
                                    : 'text-gray-400 hover:text-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                                For Sale ({forSaleDrivers?.length || 0})
                            </div>
                        </button>
                        <button
                            onClick={() => setActiveTab('my-drivers')}
                            className={`px-6 py-3 font-medium transition-all cursor-pointer ${
                                activeTab === 'my-drivers'
                                    ? 'text-green-400 border-b-2 border-green-400'
                                    : 'text-gray-400 hover:text-gray-300'
                            }`}
                        >
                            <div className="flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                My Drivers ({myDrivers?.length || 0})
                            </div>
                        </button>
                    </div>
                    
                    <SearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search by driver name, team, or acronym..."
                        label="Search Drivers"
                        showResultsText={true}
                    />
                </div>

                {/* Driver List */}
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 backdrop-blur-sm rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">
                            {activeTab === 'free' && 'Free Agent Drivers'}
                            {activeTab === 'for-sale' && 'Drivers For Sale'}
                            {activeTab === 'my-drivers' && 'My Drivers'}
                        </h2>
                        <p className="text-gray-400">
                            {filteredDrivers.length} {filteredDrivers.length === 1 ? 'driver' : 'drivers'}
                        </p>
                    </div>
                    
                    {activeTab === 'my-drivers' ? (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={closestCenter}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={filteredDrivers.map(d => `driver-${d.id}`)}
                            >
                                <MarketDriverList
                                    drivers={filteredDrivers}
                                    loading={myDriversLoading}
                                    currentUserId={internalUserId}
                                    userBudget={userBudget}
                                    userDriverCount={userDriverCount}
                                    reserveDriverId={userTeam?.reserve_driver_id}
                                    onBuyFromMarket={handlers.handleBuyFromMarket}
                                    onBuyFromUser={handlers.handleBuyFromUser}
                                    onSell={handlers.handleSell}
                                    onList={handlers.handleList}
                                    onUnlist={handlers.handleUnlist}
                                    onBuyout={handlers.handleBuyout}
                                    onViewDetails={setExpandedDriver}
                                    emptyMessage={
                                        searchQuery 
                                            ? "No drivers match your search" 
                                            : "You don't own any drivers yet"
                                    }
                                    gridColumns={4}
                                    enableDragDrop={true}
                                    swappingDriverIds={swappingDriverIds}
                                />
                            </SortableContext>
                        </DndContext>
                    ) : (
                        <MarketDriverList
                            drivers={filteredDrivers}
                            loading={
                                activeTab === 'free' ? freeDriversLoading : 
                                activeTab === 'for-sale' ? forSaleLoading : 
                                myDriversLoading
                            }
                            currentUserId={internalUserId}
                            userBudget={userBudget}
                            userDriverCount={userDriverCount}
                            reserveDriverId={userTeam?.reserve_driver_id}
                            onBuyFromMarket={handlers.handleBuyFromMarket}
                            onBuyFromUser={handlers.handleBuyFromUser}
                            onSell={handlers.handleSell}
                            onList={handlers.handleList}
                            onUnlist={handlers.handleUnlist}
                            onBuyout={handlers.handleBuyout}
                            onViewDetails={setExpandedDriver}
                            emptyMessage={
                                searchQuery 
                                    ? "No drivers match your search" 
                                    : `No ${activeTab === 'free' ? 'free agents' : 'drivers for sale'} available`
                            }
                            gridColumns={4}
                        />
                    )}
                </div>
            </div>

            {/* Expanded Driver Modal */}
            <AnimatePresence>
                {expandedDriver && (
                    <div>
                        <motion.div
                            className="fixed inset-0 backdrop-blur-md bg-black/50 z-40"
                            onClick={() => setExpandedDriver(null)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                        <DriverCardExpanded
                            key={expandedDriver.id}
                            d={expandedDriver as any}
                            setExpanded={() => setExpandedDriver(null)}
                        />
                    </div>
                )}
            </AnimatePresence>

            {/* Buy Driver Modal */}
            <AnimatePresence>
                {buyModalDriver && (
                    <DriverSaleModal
                        driver={buyModalDriver}
                        userBudget={userBudget}
                        mode="buyDriver"
                        onConfirm={handlers.confirmBuyFromMarket}
                        onCancel={() => setBuyModalDriver(null)}
                        loading={isBuyingFromMarket}
                    />
                )}
            </AnimatePresence>

            {/* Sell Driver Modal */}
            <AnimatePresence>
                {sellModalDriver && (
                    <DriverSaleModal
                        driver={sellModalDriver}
                        userDriverCount={userDriverCount}
                        mode="quickSell"
                        onConfirm={handlers.confirmSell}
                        onCancel={() => setSellModalDriver(null)}
                        loading={isSellingToMarket}
                    />
                )}
            </AnimatePresence>

            {/* List for Sale Modal */}
            <AnimatePresence>
                {listModalDriver && (
                    <DriverSaleModal
                        driver={listModalDriver}
                        userDriverCount={userDriverCount}
                        mode="listForSale"
                        onConfirm={(price) => handlers.confirmList(price!)}
                        onCancel={() => setListModalDriver(null)}
                        loading={isListing}
                    />
                )}
            </AnimatePresence>

            {/* Confirm/Success/Error Dialog */}
            <ConfirmDialog
                isOpen={dialog.isOpen}
                onClose={() => setDialog({ ...dialog, isOpen: false })}
                onConfirm={dialog.onConfirm}
                title={dialog.title}
                message={dialog.message}
                type={dialog.type}
                confirmText={dialog.confirmText}
            />
        </div>
    );
};

export default Market;
