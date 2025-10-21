import { useState } from 'react';

interface LeagueHeaderProps {
    name: string;
    description?: string | null;
    joinCode: string;
    currentParticipants: number;
    activeTab: 'lineup' | 'standings';
    onTabChange: (tab: 'lineup' | 'standings') => void;
}

export const LeagueHeader = ({
    name,
    description,
    joinCode,
    currentParticipants,
    activeTab,
    onTabChange
}: LeagueHeaderProps) => {
    const [copied, setCopied] = useState(false);

    const handleCopyJoinCode = async () => {
        try {
            await navigator.clipboard.writeText(joinCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
        }
    };

    return (
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 backdrop-blur-sm rounded-2xl p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-4">
                        {name}
                    </h1>
                    {description && (
                        <p className="text-gray-300 text-lg">
                            {description}
                        </p>
                    )}
                </div>
                <div className="flex items-center gap-4">
                    <div 
                        onClick={handleCopyJoinCode}
                        className="bg-blue-600/20 text-blue-300 px-4 py-2 rounded-full text-sm font-medium border border-blue-500/30 cursor-pointer hover:bg-blue-600/30 transition-all duration-200 flex items-center gap-2"
                    >
                        <span className="font-mono">{joinCode}</span>
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
                        {currentParticipants || 0} members
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-700/50 mt-6">
                <button
                    onClick={() => onTabChange('lineup')}
                    className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
                        activeTab === 'lineup'
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                >
                    My Lineup
                </button>
                <button
                    onClick={() => onTabChange('standings')}
                    className={`px-6 py-3 font-medium transition-all duration-200 border-b-2 ${
                        activeTab === 'standings'
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-gray-400 hover:text-gray-300'
                    }`}
                >
                    League Standings
                </button>
            </div>
        </div>
    );
};
