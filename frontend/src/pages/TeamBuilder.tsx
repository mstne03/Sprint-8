import { motion, AnimatePresence } from 'framer-motion';
import DriverCardExpanded from '@/components/picks/DriverCardExpanded';
import BuilderDriversDisplay from '@/components/picks/BuilderDriversDisplay';
import BuilderConstructorsDisplay from '@/components/picks/BuilderConstructorsDisplay';
import BuilderSearch from '@/components/picks/BuilderSearch';
import { TeamBuilderProvider, useTeamBuilderContext } from '@/contexts/TeamBuilderContext';
import HandleTeamBuild from '@/components/picks/HandleTeamBuild';

const TeamBuilderContent = () => {
    const {
        leagueLoading, driversLoading, 
        constructorsLoading, teamLoading,
        leagueError, league, navigate,
        filteredDrivers, setExpandedDriver, 
        filteredTeams, expandedDriver, leagueId
    } = useTeamBuilderContext();

    if (leagueLoading || driversLoading || constructorsLoading || teamLoading) {
        return (
            <div className="p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
                        <p className="text-gray-400 text-lg">
                            {leagueLoading ? 'Verifying league access...' : 'Loading drivers and teams...'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (leagueError || !league) {
        return (
            <div className="p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-red-400 text-2xl font-bold mb-2">Access Denied</h2>
                        <p className="text-gray-400 text-lg mb-4">You are not a member of this league</p>
                        <button
                            onClick={() => navigate('/leagues')}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            Back to Leagues
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (driversLoading || constructorsLoading) {
        return (
            <div className="p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
                        <p className="text-gray-400 text-lg">Loading drivers and constructors...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <button
                        onClick={() => navigate(`/leagues/${leagueId}`)}
                        className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to {league.name}
                    </button>
                    
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Build Your Fantasy Team
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Select 3 drivers and 1 team for your fantasy lineup in <span className="text-blue-400 font-medium">{league.name}</span>
                    </p>
                </div>
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 backdrop-blur-sm rounded-2xl p-6 mb-8">
                    <HandleTeamBuild />
                </div>
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 backdrop-blur-sm rounded-2xl p-6 mb-8">
                    <BuilderSearch />
                </div>
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 backdrop-blur-sm rounded-2xl p-6 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Select Drivers</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredDrivers?.map((driver) => (
                            <BuilderDriversDisplay
                                key={driver.id}
                                driver={driver}
                            />
                        ))}
                    </div>
                </div>
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 backdrop-blur-sm rounded-2xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Select Team</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredTeams?.map((constructor) => (
                            <BuilderConstructorsDisplay
                                key={constructor.id}
                                constructor={constructor}
                            />
                        ))}
                    </div>
                </div>
            </div>
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
                            d={expandedDriver}
                            setExpanded={() => setExpandedDriver(null)}
                        />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

const TeamBuilder = () => {
    return (
        <TeamBuilderProvider>
            <TeamBuilderContent />
        </TeamBuilderProvider>
    );
};

export default TeamBuilder;