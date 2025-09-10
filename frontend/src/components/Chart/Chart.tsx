import ChartContext from '../../context/ChartContext'
import useChartContext from '../../hooks/useChartContext'
import { useState } from 'react'

const CURRENT_YEAR = new Date().getFullYear();

const YEARS = Array.from({ length: CURRENT_YEAR - 2023 + 1 }, (_, i) => 2023 + i);

const CHARTTYPES = ["quali_h2h", "race_h2h"]

const PAGE_SIZE = 10;

export default function Chart() {
    const [page, setPage] = useState(1);

    if (!ChartContext) {
        console.log("ChartContext is null")

        return null;
    }

    const {
        loading,
        setLoading,
        error,
        setError,
        selectedYear,
        setSelectedYear,
        chartType,
        setChartType,
        chart,
        driver,
        setDriver,
    } = useChartContext();

    let paginatedCharts: string[];
    if (Array.isArray(chart)) {
        paginatedCharts = (chart as string[]).slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
    } else {
        paginatedCharts = [];
    }

    const totalPages = Array.isArray(chart)
        ? Math.ceil(chart.length / PAGE_SIZE)
        : 1;

    return (
        <>
            <div className="flex flex-col gap-20 justify-center items-center">
                <div className="flex items-center gap-3">
                    <label htmlFor="year" className="text-sm font-medium">Season</label>
                    <select 
                        id="year"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="border rounded px-3 py-2"
                    >
                        {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <select 
                        id="chartType"
                        value={chartType}
                        onChange={(e) => setChartType(e.target.value)}
                        className="border rounded px-3 py-2"
                    >
                        {CHARTTYPES.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    {loading && <span className="text-sm opacity-70">Loading...</span>}
                    {error && <span className="text-sm text-red-600">Error: {error}</span>}
                    <input
                        type="text"
                        value={driver}
                        onChange={(e) => setDriver(e.target.value)}
                        placeholder="Introduce un nombre de driver"
                        className="border p-2 rounded w-full"
                    />
                </div>

                {Array.isArray(chart)
                    ? (
                        <>
                            <div className="flex flex-wrap gap-10 justify-center items-center">
                                {paginatedCharts.map((svg, idx) =>
                                    <div key={idx + (page-1)*PAGE_SIZE} dangerouslySetInnerHTML={{ __html: svg }}
                                        style={{ width: 600, height: 400 }}
                                    />
                                )}
                            </div>
                            <div className="flex gap-2 mt-4">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-2 py-1 border rounded"
                                >
                                    Anterior
                                </button>
                                <span>Página {page} de {totalPages}</span>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={page === totalPages}
                                    className="px-2 py-1 border rounded"
                                >
                                    Siguiente
                                </button>
                            </div>
                        </>
                    )
                    : <div dangerouslySetInnerHTML={{ __html: chart }} />
                }
            </div>
        </>
    )
}
