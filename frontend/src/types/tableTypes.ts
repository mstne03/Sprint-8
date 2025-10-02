import type { AgGridReact } from "ag-grid-react";
import type { ColDef } from 'ag-grid-community'

export interface UserTeamsRow { 
    driver: {name: string; headshot: string; }; 
    points: number; 
    team: { name: string; logo: string; };
}

export type FantasyTable = {
    gridRef: React.RefObject<AgGridReact<any> | null>;
    rowData: UserTeamsRow[] | null;
    setRowData: React.Dispatch<React.SetStateAction<UserTeamsRow[] | null>>;
    colDefs: ColDef<UserTeamsRow, any>[];
}
