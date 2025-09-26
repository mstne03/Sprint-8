import type { AgGridReact } from "ag-grid-react";
import type { ColDef, IRowNode, RowSelectionOptions } from 'ag-grid-community'

export type DriverRow = { 
    driver: {name: string; headshot: string; }; 
    points: number; 
    team: { name: string; logo: string; };
}

export type DriverTable = {
    gridRef: React.RefObject<AgGridReact<any> | null>;
    rowData: DriverRow[] | null;
    setRowData: React.Dispatch<React.SetStateAction<DriverRow[] | null>>;
    colDefs: ColDef<DriverRow, any>[];
    rowSelection: RowSelectionOptions | "single" | "multiple";
    getSelectedRows: () => void;
    selectedRows: IRowNode<any>[];
    setSelectedRows: (rows: IRowNode<any>[]) => void;
}
