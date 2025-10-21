export interface League {
    id: number
    name: string
    description: string | null
    admin_user_id: number
    is_active: boolean
    max_participants: number
    join_code: string
    season_year: number
    current_participants: number
    created_at: string
}

export interface CreateLeagueRequest {
    name: string
    description?: string
    max_participants: number
    season_year: number
}

export interface JoinLeagueRequest {
    join_code: string
}

export interface LeagueParticipant {
    user_id: number
    user_name: string
    email: string
    is_admin: boolean
    joined_at: string
}

export interface LeagueParticipantsResponse {
    league_id: number
    league_name: string
    participants: LeagueParticipant[]
    total_participants: number
}

export interface JoinLeagueResponse {
    message: string
    league_id: number
    team_initialized?: boolean
    team_details?: {
        team_id: number
        assigned_drivers: number[]
        constructor_id: number
        total_cost: number
        budget_remaining: number
        error?: string
    }
}