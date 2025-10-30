import { useMemo } from 'react';
import type { DriverWithOwnership } from '@/features/Market/types/marketTypes';

interface UseFilteredDriversParams {
    freeDrivers?: DriverWithOwnership[];
    forSaleDrivers?: DriverWithOwnership[];
    sortedMyDrivers?: DriverWithOwnership[];
    activeTab: 'free' | 'for-sale' | 'my-drivers';
    searchQuery: string;
}

export const useFilteredDrivers = ({
    freeDrivers,
    forSaleDrivers,
    sortedMyDrivers,
    activeTab,
    searchQuery,
}: UseFilteredDriversParams) => {
    return useMemo(() => {
        let drivers: DriverWithOwnership[] = [];
        
        switch (activeTab) {
            case 'free':
                drivers = freeDrivers || [];
                break;
            case 'for-sale':
                drivers = forSaleDrivers || [];
                break;
            case 'my-drivers':
                drivers = sortedMyDrivers || [];
                break;
        }
        
        if (!searchQuery) return drivers;

        const query = searchQuery.toLowerCase();
        return drivers.filter(driver => 
            driver.full_name.toLowerCase().includes(query) ||
            driver.acronym.toLowerCase().includes(query) ||
            driver.team_name?.toLowerCase().includes(query)
        );
    }, [freeDrivers, forSaleDrivers, sortedMyDrivers, activeTab, searchQuery]);
};
