import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLeagues } from '@/contexts/LeaguesContext'
import { CreateLeagueModal } from '@/components/modals/CreateLeagueModal'
import { JoinLeagueModal } from '@/components/modals/JoinLeagueModal'

const Leagues = () => {
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [showJoinModal, setShowJoinModal] = useState(false)
    const navigate = useNavigate()
    
    // Hook del contexto de ligas
    const { leagues, isLoading, error } = useLeagues()

    const handleLeagueClick = (leagueId: number) => {
        navigate(`/leagues/${leagueId}`)
    }

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">
                        F1 Fantasy Leagues
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Create or join leagues to compete with friends and other F1 fans
                    </p>
                </div>
                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <div 
                        onClick={() => setShowCreateModal(true)}
                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-600/20 to-red-800/20 border border-red-500/30 backdrop-blur-sm p-8 cursor-pointer transition-all duration-300 hover:scale-105 hover:border-red-400/50 hover:shadow-2xl hover:shadow-red-500/20"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-red-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-600/20 border border-red-500/30 mb-6 group-hover:bg-red-600/30 transition-colors duration-300">
                                <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-white mb-4">
                                Create League
                            </h3>
                            
                            <p className="text-gray-300 mb-6 leading-relaxed">
                                Start your own fantasy league and invite friends to compete. Set custom rules and scoring systems.
                            </p>
                            
                            <div className="flex items-center text-red-400 font-medium group-hover:text-red-300 transition-colors duration-300">
                                <span>Get Started</span>
                                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                                </svg>
                            </div>
                        </div>
                        
                        <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                            <svg className="w-24 h-24 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        </div>
                    </div>

                    {/* Join League Card */}
                    <div 
                        onClick={() => setShowJoinModal(true)}
                        className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-600/20 to-blue-800/20 border border-blue-500/30 backdrop-blur-sm p-8 cursor-pointer transition-all duration-300 hover:scale-105 hover:border-blue-400/50 hover:shadow-2xl hover:shadow-blue-500/20"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        
                        <div className="relative z-10">
                            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-600/20 border border-blue-500/30 mb-6 group-hover:bg-blue-600/30 transition-colors duration-300">
                                <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            
                            <h3 className="text-2xl font-bold text-white mb-4">
                                Join League
                            </h3>
                            
                            <p className="text-gray-300 mb-6 leading-relaxed">
                                Enter a league code or search for public leagues to join the competition and test your F1 knowledge.
                            </p>
                            
                            <div className="flex items-center text-blue-400 font-medium group-hover:text-blue-300 transition-colors duration-300">
                                <span>Find Leagues</span>
                                <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                        </div>
                        
                        <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
                            <svg className="w-24 h-24 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                </div>

                {/* My Leagues Section */}
                <div className="rounded-2xl bg-black/30 backdrop-blur-sm border border-white/20 p-8">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center">
                        <svg className="w-6 h-6 mr-3 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                        My Leagues
                    </h2>
                    
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
                            <p className="text-gray-400 text-lg">Loading your leagues...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <p className="text-red-400 text-lg">Error loading leagues</p>
                            <p className="text-gray-500 mt-2">{error.message}</p>
                        </div>
                    ) : leagues.length === 0 ? (
                        <div className="text-center py-12">
                            <svg className="w-16 h-16 text-gray-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <p className="text-gray-400 text-lg">
                                You haven't joined any leagues yet
                            </p>
                            <p className="text-gray-500 mt-2">
                                Create or join a league to start competing!
                            </p>
                        </div>
                    ) : (
                        <div className="grid gap-6">
                            {leagues.map((league) => (
                                <div 
                                    key={league.id}
                                    onClick={() => handleLeagueClick(league.id)}
                                    className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/30 backdrop-blur-sm p-6 cursor-pointer transition-all duration-300 hover:scale-102 hover:border-purple-400/50 hover:shadow-xl hover:shadow-purple-500/20"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-300 transition-colors duration-300">
                                                    {league.name}
                                                </h3>
                                                {league.description && (
                                                    <p className="text-gray-300 text-sm leading-relaxed">
                                                        {league.description}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="flex items-center bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full text-sm font-medium border border-purple-500/30">
                                                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                </svg>
                                                {league.current_participants} members
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center justify-end text-sm">
                                            <div className="flex items-center text-blue-400">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v-2l-4.257-2.257A6 6 0 0111 7.5h3.5z" />
                                                </svg>
                                                Code: {league.join_code}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <CreateLeagueModal 
                isOpen={showCreateModal} 
                onClose={() => setShowCreateModal(false)} 
            />
            
            <JoinLeagueModal 
                isOpen={showJoinModal} 
                onClose={() => setShowJoinModal(false)} 
            />
        </div>
    )
}

export default Leagues
