import type { UserTeamsRow } from "@/types/tableTypes";
import type { ColDef, ICellRendererParams, IRowNode, RowSelectionOptions } from "ag-grid-community";
import type { AgGridReact } from "ag-grid-react";
import { useCallback, useMemo, useRef, useState } from "react";

export const useTable = () => {
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<UserTeamsRow[] | null>(null)
    const [colDefs, setColDefs] = useState<ColDef<UserTeamsRow>[]>([
        { 
            field: "team",
            flex: 0.5,
            headerComponent: () => (
                <p className="font-bold text-[170%] ">Team</p>
            ),
            filter: true,
            floatingFilter: true,
            sortable: false,
        },
    ]);

    return {
        gridRef,
        rowData,
        setRowData,
        colDefs,
    }
}