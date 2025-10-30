import { http } from '@/core/services'

export interface UserTeam {
    id: number;
    user_id: number;
    league_id: number;
    team_name: string;
    driver_1_id: number;
    driver_2_id: number;
    driver_3_id: number;
    reserve_driver_id: number | null;
    constructor_id: number;
    total_points: number;
    budget_remaining: number;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateUserTeamRequest {
    team_name: string;
    driver_1_id: number;
    driver_2_id: number;
    driver_3_id: number;
    constructor_id: number;
}

export interface UserTeamDriver {
    id: number;
    name: string;
    headshot: string | null;
}

export interface UserTeamConstructor {
    id: number;
    name: string;
    logo: string | null;
}

export interface UserTeamWithDetails {
    id: number;
    team_name: string;
    league_id: number;
    league_name: string;
    total_points: number;
    budget_remaining: number;
    created_at: string;
    updated_at: string;
    drivers: UserTeamDriver[];
    constructor: UserTeamConstructor;
}

export interface UserTeamServiceType {
    createOrUpdateTeam(leagueId: number, teamData: CreateUserTeamRequest, userId: string): Promise<UserTeam>
    getMyTeam(leagueId: number, userId: string): Promise<UserTeam | null>
    getAllMyTeams(userId: string): Promise<UserTeamWithDetails[]>
    swapReserveDriver(leagueId: number, driverId: number, userId: number): Promise<{ success: boolean; message: string; team: any }>
}

export const userTeamService: UserTeamServiceType = {
    async createOrUpdateTeam(leagueId: number, teamData: CreateUserTeamRequest, userId: string): Promise<UserTeam> {
        const { data } = await http.post(`/leagues/${leagueId}/teams?user_id=${userId}`, teamData)
        return data
    },

    async getMyTeam(leagueId: number, userId: string): Promise<UserTeam | null> {
        try {
            const { data } = await http.get(`/leagues/${leagueId}/teams/me?user_id=${userId}`)
            return data
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null
            }
            throw error
        }
    },

    async getAllMyTeams(userId: string): Promise<UserTeamWithDetails[]> {
        const { data } = await http.get(`/users/my-teams?user_id=${userId}`)
        return data
    },

    async swapReserveDriver(leagueId: number, driverId: number, userId: number): Promise<{ success: boolean; message: string; team: any }> {
        const { data } = await http.post(`/leagues/${leagueId}/teams/swap-reserve`, {
            user_id: userId,
            driver_id: driverId
        })
        return data
    }
}