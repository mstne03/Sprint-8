import { useNavigate } from 'react-router-dom'
import { useLeagues } from '@/context/LeaguesContext'
import { useLeagueModals } from '@/hooks/leagues'
import { CreateLeagueModal } from '@/components/modals'
import { JoinLeagueModal } from '@/components/modals'
import { LeagueCard, LeagueActionCard } from '@/components/leagues'

const Leagues = () => {
    const navigate = useNavigate()
    const { leagues, isLoading, error } = useLeagues()
    const { 
        showCreateModal, 
        showJoinModal, 
        openCreateModal, 
        closeCreateModal, 
        openJoinModal, 
        closeJoinModal 
    } = useLeagueModals()

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
                    <LeagueActionCard 
                        variant="create" 
                        onClick={openCreateModal} 
                    />
                    
                    <LeagueActionCard 
                        variant="join" 
                        onClick={openJoinModal} 
                    />
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
                                <LeagueCard
                                    key={league.id}
                                    id={league.id}
                                    name={league.name}
                                    description={league.description ?? undefined}
                                    current_participants={league.current_participants}
                                    join_code={league.join_code}
                                    onClick={handleLeagueClick}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modals */}
            <CreateLeagueModal 
                isOpen={showCreateModal} 
                onClose={closeCreateModal} 
            />
            
            <JoinLeagueModal 
                isOpen={showJoinModal} 
                onClose={closeJoinModal} 
            />
        </div>
    )
}

export default Leagues
