import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    DriverCardExpanded, 
    DriverSaleModal,
    MarketHeader,
    MarketTabs,
    MarketDriverSection
} from '@/features/Market/components';
import { ConfirmDialog } from '@/core/components';
import { useLeagueDetail } from '@/features/League/hooks';
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
} from '@/features/Market/hooks';
import { useUserTeam } from '@/core/hooks/userTeams';
import { useMarketStates } from '@/features/Market/hooks';

const Market = () => {
    const { leagueId } = useParams<{ leagueId: string }>();
    const navigate = useNavigate();
    const {
        expandedDriver, setExpandedDriver,
        searchQuery, setSearchQuery,
        activeTab, setActiveTab,
        buyModalDriver, setBuyModalDriver,
        sellModalDriver, setSellModalDriver,
        listModalDriver, setListModalDriver,
        dialog, setDialog
    } = useMarketStates()

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
            <div className="p-4 sm:p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-8 sm:py-12">
                        <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
                        <p className="text-gray-400 text-base sm:text-lg">
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
            <div className="p-4 sm:p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center py-8 sm:py-12">
                        <svg className="w-12 h-12 sm:w-16 sm:h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-red-400 text-xl sm:text-2xl font-bold mb-2">Access Denied</h2>
                        <p className="text-gray-400 text-base sm:text-lg mb-4">You are not a member of this league</p>
                        <button
                            onClick={() => navigate('/leagues')}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg transition-colors cursor-pointer"
                        >
                            Back to Leagues
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <MarketHeader/>

                {/* Tabs & Search */}
                <MarketTabs
                    activeTab={activeTab}
                    setActiveTab={setActiveTab}
                    searchQuery={searchQuery}
                    setSearchQuery={setSearchQuery}
                    freeDriversCount={freeDrivers?.length || 0}
                    forSaleDriversCount={forSaleDrivers?.length || 0}
                    myDriversCount={myDrivers?.length || 0}
                />

                {/* Driver List Section */}
                <MarketDriverSection
                    activeTab={activeTab}
                    filteredDrivers={filteredDrivers}
                    searchQuery={searchQuery}
                    loading={
                        activeTab === 'free' ? freeDriversLoading : 
                        activeTab === 'for-sale' ? forSaleLoading : 
                        myDriversLoading
                    }
                    currentUserId={internalUserId}
                    userBudget={userBudget}
                    userDriverCount={userDriverCount}
                    reserveDriverId={userTeam?.reserve_driver_id}
                    swappingDriverIds={swappingDriverIds}
                    sensors={sensors}
                    onDragEnd={handleDragEnd}
                    handlers={handlers}
                    onViewDetails={setExpandedDriver}
                />
            </div>

            {/* Expanded Driver Modal */}
            <AnimatePresence>
                {expandedDriver && (
                    <div>
                        <motion.div
                            className="fixed inset-0 backdrop-blur-md bg-black/50 z-[60]"
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
