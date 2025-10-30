import { useQuery } from '@tanstack/react-query'
import { useDataService } from '@/core/contexts/ServiceProvider'
import type { Driver } from '@/features/Market/types/marketTypes';

export const useDrivers = () => {
    const dataService = useDataService();

    return useQuery<Driver[]>({
        queryKey: ["drivers"],
        queryFn: () => dataService.getAllDrivers(),
        staleTime: 5 * 24 * 60 * 60 * 1000,
    });
}
