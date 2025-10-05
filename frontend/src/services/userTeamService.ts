import { http } from '@/services/axios'

export interface UserTeam {
    id: number
    user_id: number
    league_id: number
    team_name: string
    driver_1_id: number
    driver_2_id: number
    driver_3_id: number
    constructor_id: number
    total_points: number
    budget_remaining: number
    is_active: boolean
    created_at: string
    updated_at: string
}

export interface CreateUserTeamRequest {
    team_name: string
    driver_1_id: number
    driver_2_id: number
    driver_3_id: number
    constructor_id: number
}

export interface UserTeamServiceType {
    createOrUpdateTeam(leagueId: number, teamData: CreateUserTeamRequest, userId: string): Promise<UserTeam>
    getMyTeam(leagueId: number, userId: string): Promise<UserTeam | null>
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
            // Si no hay equipo (404), devolver null
            if (error.response?.status === 404) {
                return null
            }
            throw error
        }
    }
}