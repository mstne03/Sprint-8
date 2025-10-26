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
// ============================================
// Lineup and Team Display Types
// ============================================

import type { Driver } from './marketTypes';

/**
 * Simplified driver type for lineup display
 * Contains only the fields needed for rendering driver cards in league context
 */
export type LineupDriver = Pick<
  Driver, 
  'id' | 'full_name' | 'driver_color' | 'headshot_url' | 'team_name'
> & {
  fantasy_stats?: {
    price: number;
  };
  ownership?: {
    acquisition_price: number;
    asking_price: number | null;
    is_listed_for_sale: boolean;
  };
};

/**
 * Simplified team type for league display
 */
export interface LineupTeam {
  id: number;
  team_name: string;
  team_color: string;
  season_results?: {
    points: number;
  };
}

/**
 * User team data relevant for lineup tab
 */
export interface LineupUserTeam {
  budget_remaining: number;
  total_points: number;
}

/**
 * Props for LineupTab component
 */
export interface LineupTabProps {
  userTeam: LineupUserTeam | null | undefined;
  teamLoading: boolean;
  allDriversLoaded: boolean;
  allTeamsLoaded: boolean;
  selectedDrivers: (LineupDriver | undefined)[];
  selectedConstructor: LineupTeam | null;
  teamValue: number;
  onNavigateToMarket: () => void;
}

/**
 * Props for StandingsTab component
 * Uses LeagueParticipant which is already defined above
 */
export interface StandingsTabProps {
  participants: LeagueParticipant[];
  totalParticipants: number;
  isLoading: boolean;
}

/**
 * Props for TeamDisplay component
 * Reuses LineupDriver and LineupTeam types
 */
export interface TeamDisplayProps {
  drivers: (LineupDriver | undefined)[];
  constructor: LineupTeam | null;
}
