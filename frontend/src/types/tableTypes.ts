import type { AgGridReact } from "ag-grid-react";
import type { ColDef } from 'ag-grid-community'

export interface UserTeamsRow { 
    driver: {name: string; headshot: string; }; 
    points: number; 
    team: { name: string; logo: string; };
}

export interface MyTeamsRow {
    team_name: string;
    league_name: string;
    drivers: string; // Concatenated driver names
    constructor: string;
    total_points: number;
    budget_remaining: number;
    created_at: string;
    actions?: any; // For action buttons
}

export type FantasyTable = {
    gridRef: React.RefObject<AgGridReact<any> | null>;
    rowData: UserTeamsRow[] | null;
    setRowData: React.Dispatch<React.SetStateAction<UserTeamsRow[] | null>>;
    colDefs: ColDef<UserTeamsRow, any>[];
}

export type MyTeamsTable = {
    gridRef: React.RefObject<AgGridReact<any> | null>;
    rowData: MyTeamsRow[] | null;
    setRowData: React.Dispatch<React.SetStateAction<MyTeamsRow[] | null>>;
    colDefs: ColDef<MyTeamsRow, any>[];
}
