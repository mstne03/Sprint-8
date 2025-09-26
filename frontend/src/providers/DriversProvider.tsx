import { useContext, createContext } from 'react'
import type { PropsWithChildren } from 'react'
import { useTable } from '@/hooks/useTable';
import type { DriverTable } from '@/types/tableTypes';

const Ctx = createContext<DriverTable| null>(null);

export default function DriversServiceProvider({ children }: PropsWithChildren) {
    return <Ctx.Provider value={useTable()}>{children}</Ctx.Provider>
}

export function useDriversService(): DriverTable {
    const val = useContext(Ctx);
    if (!val) throw new Error("useDataService function must be called inside its context provider")
    return val;
}
