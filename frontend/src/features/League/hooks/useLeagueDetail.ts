import { useLeagueData } from './useLeagueData';
import { useLeagueTeam } from './useLeagueTeam';
import { useLeagueUI } from './useLeagueUI';
import { useLeagueActions } from './useLeagueActions';

export const useLeagueDetail = (leagueId: string) => {
    const {
        league,
        isLoading,
        error,
        userTeam,
        teamLoading,
        allDrivers,
        allTeams,
        myDriversWithOwnership,
    } = useLeagueData(leagueId);
    
    const { selectedDrivers, selectedConstructor, teamValue } = useLeagueTeam(
        userTeam!,
        myDriversWithOwnership,
        allTeams
    );
    
    const { activeTab, setActiveTab, showLeaveModal, setShowLeaveModal } = useLeagueUI();
    
    const { handleLeaveLeague, isLeavingLeague, navigateToMarket } = useLeagueActions(
        leagueId,
        setShowLeaveModal
    );
    
    return {
        // League data
        league,
        isLoading,
        error,
        
        // Team data
        userTeam,
        teamLoading,
        selectedDrivers,
        selectedConstructor,
        teamValue,
        allDrivers,
        allTeams,
        
        // UI state
        activeTab,
        setActiveTab,
        showLeaveModal,
        setShowLeaveModal,
        
        // Actions
        handleLeaveLeague,
        isLeavingLeague,
        navigateToMarket,
    };
};