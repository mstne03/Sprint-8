interface LeagueStatsProps {
    budgetRemaining: number;
    teamValue: number;
    totalPoints: number;
}

export const LeagueStats = ({
    budgetRemaining,
    teamValue,
    totalPoints
}: LeagueStatsProps) => {
    return (
        <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-600/20 to-green-800/20 border border-green-500/30 rounded-xl p-6">
                <p className="text-green-300 text-sm font-medium mb-2">Budget Remaining</p>
                <p className="text-white text-3xl font-bold">
                    ${(budgetRemaining / 1_000_000).toFixed(1)}M
                </p>
            </div>
            <div className="bg-gradient-to-br from-purple-600/20 to-pink-800/20 border border-purple-500/30 rounded-xl p-6">
                <p className="text-purple-300 text-sm font-medium mb-2">Team Value</p>
                <p className="text-white text-3xl font-bold">
                    ${(teamValue / 1_000_000).toFixed(1)}M
                </p>
            </div>
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 rounded-xl p-6">
                <p className="text-blue-300 text-sm font-medium mb-2">Total Points</p>
                <p className="text-white text-3xl font-bold">{totalPoints || 0}</p>
            </div>
        </div>
    );
};
