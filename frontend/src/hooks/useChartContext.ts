import { useContext } from 'react'
import type { UseChart } from '../context/ChartContext'
import ChartContext from '../context/ChartContext'

export default function useChartContext():UseChart {
    const useChartContext = useContext(ChartContext);

    if (!ChartContext) {
        throw new Error("useChartContext must be used in its proper context provider");
    }

    return useChartContext as UseChart;
}
