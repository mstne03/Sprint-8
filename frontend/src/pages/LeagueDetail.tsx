import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useLeagueDetail } from '@/hooks/useLeagueDetail';
import { useLeagueParticipants } from '@/hooks/useLeagueParticipants';
import { useLeagues } from '@/contexts/LeaguesContext';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import LoadingError from '../components/ui/LoadingError';

const LeagueDetail = () => {
    const { leagueId } = useParams<{ leagueId: string }>();
    const navigate = useNavigate();
    const { data: league, isLoading, error } = useLeagueDetail(leagueId!);
    const { data: participantsData, isLoading: participantsLoading } = useLeagueParticipants(parseInt(leagueId!));
    const { leaveLeague, isLeavingLeague } = useLeagues();
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const handleCopyJoinCode = async () => {
        if (league?.join_code) {
            try {
                await navigator.clipboard.writeText(league.join_code);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Failed to copy: ', err);
            }
        }
    };

    const handleLeaveLeague = async () => {
        try {
            await leaveLeague(parseInt(leagueId!));
            setShowLeaveModal(false);
            navigate('/leagues/', { replace: true });
        } catch (error) {
            console.error('Error leaving league:', error);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto">
                <LoadingSpinner message={"Loading league details"}/>
            </div>
        );
    }

    if (error || !league) {
        return (
            <div className="p-6">
                <div className="max-w-6xl mx-auto">
                    <LoadingError error={"Error loading league"} errorMessage={"League not found or access denied"}/>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 backdrop-blur-sm rounded-2xl p-8 mb-8">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-4">
                                {league.name}
                            </h1>
                            {league.description && (
                                <p className="text-gray-300 text-lg">
                                    {league.description}
                                </p>
                            )}
                        </div>
                        <div className="flex items-center gap-4">
                            <div 
                                onClick={handleCopyJoinCode}
                                className="bg-blue-600/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium border border-blue-500/30 cursor-pointer hover:bg-blue-600/30 transition-all duration-200 flex items-center gap-2"
                            >
                                <span className="font-mono">{league.join_code}</span>
                                {copied ? (
                                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                )}
                            </div>
                            <div className="bg-purple-600/20 text-purple-300 px-4 py-2 rounded-full text-sm font-medium border border-purple-500/30">
                                {league.current_participants || 0} members
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-4">
                        <button 
                            onClick={() => navigate(`/leagues/${leagueId}/team-builder`)}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                        >
                            Create/Edit Team
                        </button>
                        <button 
                            onClick={() => setShowLeaveModal(true)}
                            disabled={isLeavingLeague}
                            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-red-400 disabled:to-red-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
                        >
                            {isLeavingLeague ? 'Leaving...' : 'Leave League'}
                        </button>
                    </div>
                </div>

                {/* Content sections */}
                <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 backdrop-blur-sm rounded-2xl p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Participants</h2>
                        
                        {participantsLoading ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                            </div>
                        ) : participantsData?.participants ? (
                            <div className="space-y-3">
                                {participantsData.participants.map((participant) => (
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
                                        Total: {participantsData.total_participants} participants
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
            </div>

            {/* Leave League Confirmation Modal */}
            {showLeaveModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-2xl p-8 max-w-md w-full">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-4 bg-red-600/20 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-white mb-4">
                                Leave League
                            </h3>
                            <p className="text-gray-300 mb-8">
                                Are you sure you want to leave <strong className="text-white">{league.name}</strong>? 
                                This action cannot be undone and you'll need the join code to rejoin.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setShowLeaveModal(false)}
                                    disabled={isLeavingLeague}
                                    className="flex-1 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-800 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleLeaveLeague}
                                    disabled={isLeavingLeague}
                                    className="flex-1 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-red-400 disabled:to-red-500 text-white px-4 py-3 rounded-lg font-medium transition-all duration-200"
                                >
                                    {isLeavingLeague ? 'Leaving...' : 'Leave League'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeagueDetail;