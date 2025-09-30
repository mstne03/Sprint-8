import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Driver } from '@/features/drivers/types';

interface PicksContextType {
    selectedDrivers: Driver[];
    selectedConstructor: string | null;
    addDriver: (driver: Driver) => boolean;
    removeDriver: (driverName: string) => void;
    setSelectedConstructor: (constructor: string | null) => void;
    isDriverSelected: (driverName: string) => boolean;
    isMaxDriversSelected: boolean;
    canContinue: boolean;
}

const PicksContext = createContext<PicksContextType | undefined>(undefined);

interface PicksProviderProps {
    children: ReactNode;
}

export const PicksProvider = ({ children }: PicksProviderProps) => {
    const [selectedDrivers, setSelectedDrivers] = useState<Driver[]>([]);
    const [selectedConstructor, setSelectedConstructorState] = useState<string | null>(null);

    const addDriver = (driver: Driver): boolean => {
        if (selectedDrivers.length >= 3 || isDriverSelected(driver.full_name)) {
            return false;
        }
        setSelectedDrivers(prev => [...prev, driver]);
        return true;
    };

    const removeDriver = (driverName: string) => {
        setSelectedDrivers(prev => prev.filter(driver => driver.full_name !== driverName));
    };

    const setSelectedConstructor = (constructor: string | null) => {
        setSelectedConstructorState(constructor);
    };

    const isDriverSelected = (driverName: string): boolean => {
        return selectedDrivers.some(driver => driver.full_name === driverName);
    };

    const isMaxDriversSelected = selectedDrivers.length >= 3;
    const canContinue = selectedDrivers.length === 3 && selectedConstructor !== null;

    const value: PicksContextType = {
        selectedDrivers,
        selectedConstructor,
        addDriver,
        removeDriver,
        setSelectedConstructor,
        isDriverSelected,
        isMaxDriversSelected,
        canContinue,
    };

    return (
        <PicksContext.Provider value={value}>
            {children}
        </PicksContext.Provider>
    );
};

export const usePicks = (): PicksContextType => {
    const context = useContext(PicksContext);
    if (context === undefined) {
        throw new Error('usePicks must be used within a PicksProvider');
    }
    return context;
};