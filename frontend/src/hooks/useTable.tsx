import type { DriverRow } from "@/types/tableTypes";
import type { ColDef, ICellRendererParams, IRowNode, RowSelectionOptions } from "ag-grid-community";
import type { AgGridReact } from "ag-grid-react";
import { useCallback, useMemo, useRef, useState } from "react";

export const useTable = () => {
    const gridRef = useRef<AgGridReact>(null);
    const [rowData, setRowData] = useState<DriverRow[] | null>(null)
    const [selectedRows, setSelectedRows] = useState<IRowNode<any>[]>([]);
    const [colDefs, setColDefs] = useState<ColDef<DriverRow>[]>([
        { 
            field: "driver",
            flex: 0.5,
            headerComponent: () => (
                <p className="font-bold text-[170%] ">Driver</p>
            ),
            filter: true,
            floatingFilter: true,
            sortable: false,
            cellRenderer: (params: ICellRendererParams) => (
                <div className="flex flex-row relative gap-5">
                    <p className="text-wrap max-w-[60%]">{params.value?.name}</p>
                    <img
                        className="absolute md:left-[70%] md:max-w-[35%] md:top-[-10%] left-[75%] max-w-[40%]"
                        src={params.value?.headshot}
                        alt={params.value?.name} 
                    />
                </div>
            ),
            filterValueGetter: (params) => params.data?.driver.name,
            valueFormatter: (params) => params.data?.driver.name || "",
        },
        { 
            field: "points", 
            headerComponent: () => (
                <p className="font-bold text-[170%] ">Points</p>
            ), 
            flex: 1
        },
        { 
            field: "team", 
            flex: 1,
            headerComponent: () => (
                <p className="font-bold text-[170%] ">Team</p>
            ),
            filter: true, 
            floatingFilter: true, 
            sortable: false,
            cellRenderer: (params: ICellRendererParams) => (
                <div className="flex flex-row relative">
                    <p className="">{params.value?.name}</p>
                    <img
                        className="absolute md:left-[55%] md:top-[50%] md:max-w-[6%] top-[30%] left-[85%] max-w-[20%]"
                        src={params.value?.logo}
                        alt={params.value?.name}
                    />
                </div>
            ),
            filterValueGetter: (params) => params.data?.team.name,
            valueFormatter: (params) => params.data?.team.name || "",
        },
    ]);

    const rowSelection = useMemo<
        RowSelectionOptions | "single" | "multiple"
    >(() => {
        return {
            mode: "multiRow",
            headerCheckbox: false,
            isRowSelectable: (params) => selectedRows.length < 3 || !!params.isSelected(),
        };
    }, [selectedRows]);

    const getSelectedRows = useCallback(() => {
        const selectedNodes: IRowNode<any>[] = [];

        gridRef.current!.api.forEachNode(node => {
            if (node.isSelected()) {
                selectedNodes.push(node);
            }
        })

        setSelectedRows(selectedNodes)
    }, [])

    return {
        gridRef,
        rowData,
        setRowData,
        colDefs,
        rowSelection,
        getSelectedRows,
        selectedRows,
        setSelectedRows,
    }
}