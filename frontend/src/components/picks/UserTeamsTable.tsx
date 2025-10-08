import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import { AgGridReact } from 'ag-grid-react';
import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { themeQuartz } from 'ag-grid-community';
import type { MyTeamsRow } from '@/types/tableTypes';
import { useMyTeamsTable } from '@/hooks/useMyTeamsTable';
import { userTeamService } from '@/services/userTeamService';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '../ui/LoadingSpinner';
import LoadingError from '../ui/LoadingError';

ModuleRegistry.registerModules([AllCommunityModule]);

const myTheme = themeQuartz.withParams({
    fontFamily: 'Formula1',
    wrapperBorder: { 
        width: 3.5, 
        color: '#e10600'
    },
    headerRowBorder: {
        width: 2,
        color: '#ffffff30'
    },
    backgroundColor: 'rgba(0,0,0,.25)',
    foregroundColor: '#ffffff',
    borderColor: '#ffffff20',
    rowBorder: { 
        width: 1,
        color: '#ffffff10'
    },
    headerBackgroundColor: 'rgba(225,6,0,.15)',
});

export default function UserTeamsTable() {
    const { user } = useAuth();
    
    const {
        gridRef,
        rowData,
        setRowData,
        colDefs,
    } = useMyTeamsTable();

    const { data: myTeams, isLoading, error } = useQuery({
        queryKey: ['my-teams', user?.id],
        queryFn: () => userTeamService.getAllMyTeams(user!.id),
        enabled: !!user?.id,
    });

    useEffect(() => {
        if (myTeams) {
            const formattedData: MyTeamsRow[] = myTeams.map(team => ({
                team_name: team.team_name,
                league_name: team.league_name,
                drivers: team.drivers.map(driver => driver.name).join(', '),
                constructor: team.constructor.name,
                total_points: team.total_points,
                budget_remaining: team.budget_remaining,
                created_at: team.created_at,
            }));
            setRowData(formattedData);
        }
    }, [myTeams, setRowData]);

    if (isLoading) {
        return (
            <div className="max-w-6xl mx-auto">
                <LoadingSpinner message={"Loading your teams..."}/>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <LoadingError error={"Error loading Teams"} errorMessage={"Unable to load your teams, please try again later"}/>
            </div>
        );
    }

    if (!myTeams || myTeams.length === 0) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <div className="bg-gray-900/20 border border-gray-600/50 rounded-lg p-8 max-w-md text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-700 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                        </svg>
                    </div>
                    <h3 className="text-white font-formula1 text-xl mb-2">No Teams Yet</h3>
                    <p className="text-gray-400 mb-4">You haven't created any fantasy teams yet. Join a league and start building your team!</p>
                    <button 
                        onClick={() => window.location.href = '/leagues'}
                        className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-formula1 rounded-lg transition-colors"
                    >
                        Join a League
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full">
            
            <div className="bg-black/20 rounded-lg border border-red-600/30 p-4 shadow-2xl">
                <div className="mb-6 bg-black/30 backdrop-blur-sm border border-white/20 rounded-2xl p-6">
                    <h1 className="text-3xl font-formula1 text-white mb-2">My Fantasy Teams</h1>
                    <p className="text-gray-400">Manage your fantasy F1 teams across all leagues</p>
                    <div className="flex items-center gap-4 mt-3">
                        <div className="bg-gray-800/50 px-4 py-2 rounded-lg border border-gray-600/50">
                            <span className="text-gray-400 text-sm">Total Teams: </span>
                            <span className="text-white font-bold">{myTeams.length}</span>
                        </div>
                    </div>
                </div>
                <AgGridReact<MyTeamsRow>
                    ref={gridRef}
                    rowHeight={80}
                    theme={myTheme}
                    rowData={rowData}
                    columnDefs={colDefs}
                    suppressHorizontalScroll={true}
                    animateRows={true}
                    rowSelection="multiple"
                    enableCellTextSelection={true}
                    domLayout="autoHeight"
                    getRowStyle={(params) => {
                        // Alternate row colors
                        if (params.node.rowIndex! % 2 === 0) {
                            return { 
                                backgroundColor: 'rgba(0,0,0,.05)',
                            };
                        } else {
                            return { 
                                backgroundColor: 'rgba(225,6,0,.03)',
                            };
                        }
                    }}
                />
            </div>
        </div>
    );
}