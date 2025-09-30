import { useContext, createContext } from 'react'
import type { PropsWithChildren } from 'react'
import { useTable } from '@/hooks/useTable';
import type { FantasyTable } from '@/types/tableTypes';

const Ctx = createContext<FantasyTable| null>(null);

export default function FantasyTableProvider({ children }: PropsWithChildren) {
    return <Ctx.Provider value={useTable()}>{children}</Ctx.Provider>
}

export function useFantasyTable(): FantasyTable {
    const val = useContext(Ctx);
    if (!val) throw new Error("useFantasyTable function must be called inside its context provider")
    return val;
}
