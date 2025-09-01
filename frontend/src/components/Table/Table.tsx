import { AgGridReact } from 'ag-grid-react'
import type { ColDef } from 'ag-grid-community'
import { ModuleRegistry, AllCommunityModule } from 'ag-grid-community'
import { themeBalham } from 'ag-grid-community'
import { useState, useEffect } from 'react'

type DriverSeasonRow = {
  driver_uid?: string
  season: number
  driver_number: number
  broadcast_name?: string
  name_acronym: string
  first_name?: string
  last_name?: string
  full_name: string
  team_name: string
  team_colour?: string
  country_code?: string
  headshot_url?: string
}

ModuleRegistry.registerModules([AllCommunityModule]);

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://localhost:800/api";

const CURRENT_YEAR = new Date().getFullYear();

const YEARS = Array.from({ length: CURRENT_YEAR - 2023 + 1 }, (_, i) => 2023 + i);

export default function Table() {
    const [rowData, setRowData] = useState<DriverSeasonRow[]>([]);
    const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [colDefs] = useState<ColDef<DriverSeasonRow>[]>([
        { field: "name_acronym", headerName: "Acronym" },
        { field: "season", headerName: "Season" },
        { field: "driver_number", headerName: "Number" },
        { field: "full_name", headerName: "Full Name" },
        { field: "team_name", headerName: "Team" },
    ]);

    const defaultColDef:ColDef = {
        flex:1,
        sortable:true,
        filter:true,
        resizable:true,
    }

    const Theme = themeBalham.withParams({ accentColor: 'red' })

    useEffect(() => {
        const controller = new AbortController();

        async function load() {
            try {
                setLoading(true); setError(null);

                const res = await fetch(`${API_BASE}/drivers/?years=${YEARS.join(',')}&selectedYear=${selectedYear}`, { signal: controller.signal});

                if (!res.ok) throw new Error(`HTTP${res.status}`);

                const data: DriverSeasonRow[] = await res.json();
                const rows = Array.isArray(data) ? data : (data as any).rows ?? [];
                setRowData(rows);
            } catch (e: any) {
                if (e.name !== "AbortError") setError(e.message ?? "Error loading data");
                setRowData([]);
            } finally {
                setLoading(false);
            }
        }
        load()
        return () => controller.abort();
    }, [selectedYear]);

    return (
        <div className="p-10 space-y-4">
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
                {loading && <span className="text-sm opacity-70">Loading...</span>}
                {error && <span className="text-sm text-red-600">Error: {error}</span>}
            </div>

            <div className="h-[500px] p-10">
                <AgGridReact 
                    rowData={rowData}
                    columnDefs={colDefs}
                    defaultColDef={defaultColDef}
                    theme={Theme}
                />
            </div>
        </div>
    )
}
