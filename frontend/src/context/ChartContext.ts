import { createContext } from 'react'
import type { Dispatch, SetStateAction } from 'react'

type HookFunc<T> = Dispatch<SetStateAction<T>>

export type UseChart = {
    loading: boolean;
    setLoading: HookFunc<boolean>;
    error:string|null;
    setError: HookFunc<string|null>;
    selectedYear: number;
    setSelectedYear: HookFunc<number>;
    chartType: string;
    setChartType: HookFunc<string>;
    chart: string;
    setChart: HookFunc<string>;
    driver: string;
    setDriver: HookFunc<string>;
};

const ChartContext = createContext<UseChart|null>(null);

export default ChartContext;
