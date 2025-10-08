import { useTeamBuilderContext } from "@/context/TeamBuilderContext";
import { TeamCreate } from "@/components/ui"

export const HandleTeamBuild = () => {
    const { 
        teamName, setTeamName, 
        selectedDrivers, budgetBarWidth,
        handleSaveTeam, isTeamComplete,
        getButtonText
    } = useTeamBuilderContext();
    return (
        <div>
            <h2 className="text-2xl font-bold text-white mb-4">Your Team</h2>
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                    Team Name
                </label>
                <input
                    type="text"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    placeholder="Enter your team name..."
                    className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                />
            </div>
            <TeamCreate />
            <div className="mt-6 p-4 bg-gradient-to-r from-green-600/10 to-blue-600/10 border border-green-500/20 rounded-lg">
                <div className="flex justify-between items-center">
                    <span className="text-gray-300 font-medium">Total Budget:</span>
                    <span className="text-green-300 font-bold text-lg">
                        ${(selectedDrivers.reduce((acc, driver) => acc + driver.fantasy_stats.price, 0) / 1_000_000).toFixed(1)}M
                        <span className="text-gray-400 text-sm ml-1">/ 100M</span>
                    </span>
                </div>
                <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                    <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ 
                            width: `${budgetBarWidth}%` 
                        }}
                    ></div>
                </div>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-600/30">
                <button
                    onClick={handleSaveTeam}
                    disabled={!isTeamComplete}
                    className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-all duration-200"
                >
                    {getButtonText()}
                </button>
            </div>
        </div>
    )
}