import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { leagueService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { useLeagues } from '@/context/LeaguesContext';
import { useUserTeam } from '@/hooks/userTeams/useUserTeam';
import { useDrivers } from '@/hooks/db/drivers';
import { useTeams } from '@/hooks/db/teams';

export const useLeagueDetail = (leagueId: string) => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { leaveLeague, isLeavingLeague } = useLeagues();
    
    // State management
    const [activeTab, setActiveTab] = useState<'lineup' | 'standings'>('lineup');
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    
    // Data fetching
    const leagueQuery = useQuery({
        queryKey: ['league-detail', leagueId, user?.id],
        queryFn: () => leagueService.getLeagueById(parseInt(leagueId), user!.id),
        enabled: !!leagueId && !!user?.id,
        staleTime: 5 * 60 * 1000,
        retry: 1,
    });
    
    const { data: userTeam, isLoading: teamLoading } = useUserTeam(parseInt(leagueId));
    const { data: allDrivers } = useDrivers();
    const { data: allTeams } = useTeams();
    
    // Computed values - Obtener los drivers completos desde los IDs
    const selectedDrivers = useMemo(() => {
        if (!userTeam || !allDrivers) return [];
        return [
            allDrivers.find(d => d.id === userTeam.driver_1_id),
            allDrivers.find(d => d.id === userTeam.driver_2_id),
            allDrivers.find(d => d.id === userTeam.driver_3_id),
        ].filter(Boolean);
    }, [userTeam, allDrivers]);
    
    // Obtener el constructor completo desde el ID
    const selectedConstructor = useMemo(() => {
        if (!userTeam || !allTeams) return null;
        return allTeams.find(t => t.id === userTeam.constructor_id) || null;
    }, [userTeam, allTeams]);
    
    // Calcular el valor total del equipo
    const teamValue = useMemo(() => {
        if (!selectedDrivers.length) return 0;
        return selectedDrivers.reduce((total, driver) => {
            return total + (driver?.fantasy_stats?.price || 0);
        }, 0);
    }, [selectedDrivers]);
    
    // Actions
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
        // League data
        league: leagueQuery.data,
        isLoading: leagueQuery.isLoading,
        error: leagueQuery.error,
        
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