import { useContext, createContext } from 'react'
import type { PropsWithChildren } from 'react'
import type { DataService } from '@/types/dataService'
import { dataService } from '@/services/dbService'

const Ctx = createContext<DataService | null>(null);

export default function DataServiceProvider({ children }: PropsWithChildren) {
    return <Ctx.Provider value={dataService}>{children}</Ctx.Provider>
}

export function useDataService(): DataService {
    const val = useContext(Ctx);
    if (!val) throw new Error("useDataService function must be called inside its context provider")
    return val;
}
