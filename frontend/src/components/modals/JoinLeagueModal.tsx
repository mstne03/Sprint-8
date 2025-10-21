import React, { useState } from 'react';
import { useLeagues } from '../../context/LeaguesContext';
import { useNavigate } from 'react-router-dom'

interface JoinLeagueModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const JoinLeagueModal: React.FC<JoinLeagueModalProps> = ({ isOpen, onClose }) => {
    const { joinLeague } = useLeagues();
    const [joinCode, setJoinCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setSuccessMessage(null);

        try {
            const result = await joinLeague({ join_code: joinCode.trim() });
            
            // Show success message with team initialization info
            if (result.team_initialized) {
                const budget = result.team_details?.budget_remaining 
                    ? (result.team_details.budget_remaining / 1_000_000).toFixed(1) 
                    : '100.0';
                setSuccessMessage(`Welcome! Your starter team has been created with 3 free drivers. Full budget available: $${budget}M`);
            } else {
                setSuccessMessage('Successfully joined league!');
            }
            
            // Navigate after showing message briefly
            setTimeout(() => {
                onClose();
                setJoinCode('');
                setSuccessMessage(null);
                navigate(`/leagues/${result.league_id}`);
            }, 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to join league');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 border border-gray-700/50 backdrop-blur-sm rounded-2xl p-8 max-w-md w-full">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-white">Join League</h3>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="text-center mb-6">
                    <svg className="w-16 h-16 text-blue-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p className="text-gray-300">Enter the league code provided by the league administrator to join.</p>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-3 mb-4">
                        <p className="text-red-300 text-sm">{error}</p>
                    </div>
                )}

                {successMessage && (
                    <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-3 mb-4">
                        <p className="text-green-300 text-sm">{successMessage}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="joinCode" className="block text-sm font-medium text-gray-300 mb-2">
                            League Code
                        </label>
                        <input
                            type="text"
                            id="joinCode"
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                            required
                            className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all text-center text-lg font-mono tracking-wider"
                            placeholder="ENTER-CODE"
                            maxLength={10}
                        />
                        <p className="text-xs text-gray-500 mt-2 text-center">
                            League codes are typically 6-10 characters long
                        </p>
                    </div>

                    <div className="flex space-x-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 px-4 bg-gray-600/50 hover:bg-gray-600/70 text-white rounded-lg font-medium transition-all duration-200"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !joinCode.trim()}
                            className="flex-1 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-all duration-200 flex items-center justify-center"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                    Joining...
                                </>
                            ) : (
                                'Join League'
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-6 pt-6 border-t border-gray-700/50">
                    <p className="text-center text-gray-400 text-sm">
                        Don't have a league code?{' '}
                        <button 
                            onClick={() => {
                                onClose();
                            }}
                            className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                            Create your own league
                        </button>
                    </p>
                </div>
            </div>
        </div>
    );
};