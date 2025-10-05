import { useDataService } from "@/providers/ServiceProvider";
import { useQuery } from "@tanstack/react-query";
import type { Team } from '../types/teamsTypes'

export const useTeams = () => {
    const dataService = useDataService();

    return useQuery<Team[]>({
        queryKey: ["teams"],
        queryFn: () => dataService.getAllTeams(),
        staleTime: 5 * 24 * 60 * 60 * 1000,
    })
}
