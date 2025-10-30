import { useNavigate } from 'react-router-dom';
import { useLeagues } from '@/core/contexts/LeaguesContext';

/**
 * Hook: Orchestrate league actions
 * Responsibility: Action handlers only
 */
export const useLeagueActions = (
    leagueId: string,
    setShowLeaveModal: (show: boolean) => void
) => {
    const navigate = useNavigate();
    const { leaveLeague, isLeavingLeague } = useLeagues();
    
    const handleLeaveLeague = async () => {
        try {
            await leaveLeague(parseInt(leagueId));
            setShowLeaveModal(false);
            navigate('/leagues/', { replace: true });
        } catch (error) {
            console.error('Error leaving league:', error);
        }
    };
    
    const navigateToMarket = () => {
        navigate(`/leagues/${leagueId}/market`);
    };
    
    return {
        handleLeaveLeague,
        isLeavingLeague,
        navigateToMarket,
    };
};