import type { StandingsTabProps } from '@/types/leagueTypes';

export const StandingsTab = ({
    participants,
    totalParticipants,
    isLoading
}: StandingsTabProps) => {
    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 backdrop-blur-sm rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-6">Participants</h2>
                
                {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                    </div>
                ) : participants.length > 0 ? (
                    <div className="space-y-3">
                        {participants.map((participant) => (
                            <div 
                                key={participant.user_id}
                                className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600/30"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                                        {participant.user_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-white font-medium">{participant.user_name}</p>
                                        <p className="text-gray-400 text-sm">{participant.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {participant.is_admin && (
                                        <span className="bg-yellow-600/20 text-yellow-300 px-3 py-1 rounded-full text-xs font-medium border border-yellow-500/30">
                                            Admin
                                        </span>
                                    )}
                                    <span className="text-gray-400 text-xs">
                                        Joined {new Date(participant.joined_at).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                        ))}
                        
                        <div className="mt-6 pt-4 border-t border-gray-600/30">
                            <p className="text-gray-400 text-sm">
                                Total: {totalParticipants} participants
                            </p>
                        </div>
                    </div>
                ) : (
                    <p className="text-gray-400">No participants found</p>
                )}
            </div>
            
            <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 backdrop-blur-sm rounded-2xl p-8">
                <h2 className="text-2xl font-bold text-white mb-4">Leaderboard</h2>
                <p className="text-gray-400">Leaderboard coming soon...</p>
            </div>
        </div>
    );
};
