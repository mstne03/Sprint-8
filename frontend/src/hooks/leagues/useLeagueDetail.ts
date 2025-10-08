import { useQuery } from '@tanstack/react-query';
import { leagueService } from '@/services';
import { useAuth } from '@/context/AuthContext';

export const useLeagueDetail = (leagueId: string) => {
    const { user } = useAuth();
    
    return useQuery({
        queryKey: ['league-detail', leagueId, user?.id],
        queryFn: () => leagueService.getLeagueById(parseInt(leagueId), user!.id),
        enabled: !!leagueId && !!user?.id,
        staleTime: 5 * 60 * 1000, // 5 minutos
        retry: 1,
    });
};