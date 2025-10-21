import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DriverCardExpanded } from '@/components/userTeams';
import { MarketDriverList, BuyDriverModal } from '@/components/market';
import { useLeagueDetail } from '@/hooks/leagues';
import { useFreeDrivers, useDriversForSale, useUserDrivers, useBuyFromMarket } from '@/hooks/market';
import { useUserTeam } from '@/hooks/userTeams';
import type { DriverWithOwnership } from '@/types/marketTypes';

const Market = () => {
    const { leagueId } = useParams<{ leagueId: string }>();
    const navigate = useNavigate();
    const [expandedDriver, setExpandedDriver] = useState<DriverWithOwnership | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'free' | 'for-sale' | 'my-drivers'>('free');
    const [buyModalDriver, setBuyModalDriver] = useState<DriverWithOwnership | null>(null);

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

    // Mutations
    const { mutate: buyFromMarket, isPending: isBuyingFromMarket } = useBuyFromMarket();

    // Handlers
    const handleBuyFromMarket = (driverId: number) => {
        const driver = freeDrivers?.find(d => d.id === driverId);
        if (driver) {
            setBuyModalDriver(driver);
        }
    };

    const confirmBuyFromMarket = () => {
        if (!buyModalDriver || !leagueId) return;

        buyFromMarket(
            {
                leagueId: Number(leagueId),
                driverId: buyModalDriver.id,
                request: {
                    buyer_user_id: internalUserId,
                },
            },
            {
                onSuccess: () => {
                    setBuyModalDriver(null);
                    // TODO: Mostrar toast de éxito
                },
                onError: (error: any) => {
                    console.error('Error buying driver:', error);
                    // TODO: Mostrar toast de error con el mensaje del backend
                },
            }
        );
    };

    const handleBuyFromUser = (driverId: number) => {
        console.log('Buy from user:', driverId);
        // TODO: Mostrar modal de confirmación
    };

    const handleSell = (driverId: number) => {
        console.log('Quick sell:', driverId);
        // TODO: Mostrar modal de confirmación (80% refund)
    };

    const handleList = (driverId: number) => {
        console.log('List for sale:', driverId);
        // TODO: Mostrar modal para establecer precio
    };

    const handleUnlist = (driverId: number) => {
        console.log('Unlist:', driverId);
        // TODO: Mostrar modal de confirmación
    };

    const handleBuyout = (driverId: number) => {
        console.log('Buyout:', driverId);
        // TODO: Mostrar modal de confirmación con replacement preview
    };

    // Filter drivers by search query
    const filteredDrivers = useMemo(() => {
        let drivers: DriverWithOwnership[] = [];
        
        switch (activeTab) {
            case 'free':
                drivers = freeDrivers || [];
                break;
            case 'for-sale':
                drivers = forSaleDrivers || [];
                break;
            case 'my-drivers':
                drivers = myDrivers || [];
                break;
        }
        
        if (!searchQuery) return drivers;

        const query = searchQuery.toLowerCase();
        return drivers.filter(driver => 
            driver.full_name.toLowerCase().includes(query) ||
            driver.acronym.toLowerCase().includes(query) ||
            driver.team_name?.toLowerCase().includes(query)
        );
    }, [freeDrivers, forSaleDrivers, myDrivers, activeTab, searchQuery]);

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
                                    ${(userBudget / 1_000_000).toFixed(1)}M
                                </p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-600/20 to-blue-700/20 border border-blue-500/50 rounded-xl px-6 py-3">
                                <p className="text-blue-300 text-sm font-medium">Drivers</p>
                                <p className="text-white text-2xl font-bold">
                                    {userDriverCount}/4
                                </p>
                            </div>
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
                    
                    <div className="max-w-md mx-auto">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Search Drivers
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by driver name, team, or acronym..."
                                className="w-full px-4 py-3 pl-10 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                            />
                            <svg 
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                                />
                            </svg>
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-600/50 transition-colors cursor-pointer"
                                >
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        {searchQuery && (
                            <p className="text-sm text-gray-400 mt-2">
                                Showing results for "<span className="text-white">{searchQuery}</span>"
                            </p>
                        )}
                    </div>
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
                        onBuyFromMarket={handleBuyFromMarket}
                        onBuyFromUser={handleBuyFromUser}
                        onSell={handleSell}
                        onList={handleList}
                        onUnlist={handleUnlist}
                        onBuyout={handleBuyout}
                        onViewDetails={setExpandedDriver}
                        emptyMessage={
                            searchQuery 
                                ? "No drivers match your search" 
                                : activeTab === 'my-drivers' 
                                    ? "You don't own any drivers yet"
                                    : `No ${activeTab === 'free' ? 'free agents' : 'drivers for sale'} available`
                        }
                        gridColumns={4}
                    />
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
                    <BuyDriverModal
                        driver={buyModalDriver}
                        userBudget={userBudget}
                        onConfirm={confirmBuyFromMarket}
                        onCancel={() => setBuyModalDriver(null)}
                        loading={isBuyingFromMarket}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default Market;
