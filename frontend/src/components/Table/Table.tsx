import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community'
import { AgGridReact } from 'ag-grid-react'
import { useEffect } from 'react'
import { useDrivers } from '@/features/drivers/hooks'
import { themeQuartz } from 'ag-grid-community'
import type { DriverRow } from '@/types/tableTypes'
import { useDriversService } from '@/providers/DriversProvider'

ModuleRegistry.registerModules([AllCommunityModule]);

const myTheme = themeQuartz.withParams({
    fontFamily: 'Formula1',
    wrapperBorder: { width: 3.5, },
    headerRowBorder: false,
    backgroundColor: 'rgba(000,00,0,.20)',
    foregroundColor: '#ffffff',
    borderColor: '#ffffff50',
    rowBorder: { width: 3.5, },
})

export default function Table() {
    const { data: drivers } = useDrivers();
    
    const {
        gridRef,
        rowData,
        setRowData,
        colDefs,
        rowSelection,
        getSelectedRows,
    } = useDriversService()

    useEffect(() => {
        if (drivers) {
            setRowData(drivers.map(d => ({
                driver: {
                    name: d.full_name,
                    headshot: d.headshot_url,
                },
                points: d.season_results.points,
                team: {
                    name: d.team_name,
                    logo: `/teams/${(d.team_name || "").replace(/\s+/g, "").toLowerCase()}.svg`
                },
            })));
        }
    }, [drivers]);

    return (
        <AgGridReact<DriverRow>
            ref={gridRef}
            rowHeight={70}
            theme={myTheme}
            rowData={rowData}
            columnDefs={colDefs}
            suppressHorizontalScroll={true}
            rowSelection={rowSelection}
            onSelectionChanged={getSelectedRows}
        />
    )
}
