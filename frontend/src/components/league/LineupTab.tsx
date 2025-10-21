import { LeagueStats } from './LeagueStats';
import { TeamDisplay } from './TeamDisplay';

interface Driver {
    id: number;
    full_name: string;
    driver_color: string;
    headshot_url: string;
    team_name?: string;
    fantasy_stats?: {
        price: number;
    };
}

interface Team {
    id: number;
    team_name: string;
    team_color: string;
    season_results?: {
        points: number;
    };
}

interface UserTeam {
    budget_remaining: number;
    total_points: number;
}

interface LineupTabProps {
    userTeam: UserTeam | null | undefined;
    teamLoading: boolean;
    allDriversLoaded: boolean;
    allTeamsLoaded: boolean;
    selectedDrivers: (Driver | undefined)[];
    selectedConstructor: Team | null;
    teamValue: number;
    onNavigateToMarket: () => void;
}

export const LineupTab = ({
    userTeam,
    teamLoading,
    allDriversLoaded,
    allTeamsLoaded,
    selectedDrivers,
    selectedConstructor,
    teamValue,
    onNavigateToMarket
}: LineupTabProps) => {
    if (teamLoading || !allDriversLoaded || !allTeamsLoaded) {
        return (
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 backdrop-blur-sm rounded-2xl p-8">
                <div className="flex flex-col items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mb-4"></div>
                    <p className="text-gray-400">Loading your team...</p>
                </div>
            </div>
        );
    }

    if (!userTeam) {
        return (
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 backdrop-blur-sm rounded-2xl p-8">
                <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gray-700/30 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No Team Yet</h3>
                    <p className="text-gray-400 text-lg mb-6">You haven't created a team for this league</p>
                    <button 
                        onClick={onNavigateToMarket}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                        Create Your Team
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 backdrop-blur-sm rounded-2xl p-8">
            <div className="space-y-6">
                {/* Stats Cards */}
                <LeagueStats
                    budgetRemaining={userTeam.budget_remaining}
                    teamValue={teamValue}
                    totalPoints={userTeam.total_points}
                />

                {/* Team Display */}
                <TeamDisplay
                    drivers={selectedDrivers}
                    constructor={selectedConstructor}
                />

                {/* Market Button */}
                <div className="mt-6 pt-6 border-t border-gray-700/50">
                    <button 
                        onClick={onNavigateToMarket}
                        className="hover:cursor-pointer w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Driver/Constructor Market
                    </button>
                </div>

                {/* Race Weekend Performance - Placeholder */}
                <div className="mt-8 pt-8 border-t border-gray-700/50">
                    <h3 className="text-xl font-bold text-white mb-4">Race Weekend Performance</h3>
                    <div className="text-center py-8 bg-gray-800/30 rounded-lg">
                        <p className="text-gray-400">Performance history coming soon...</p>
                        <p className="text-gray-500 text-sm mt-2">Track your points across all race weekends</p>
                    </div>
                </div>
            </div>
        </div>
    );
};
