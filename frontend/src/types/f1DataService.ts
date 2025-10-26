import type { Driver } from '@/types/marketTypes'
import type { Team } from '@/types/teamsTypes'

export type F1DataService = {
    getAllDrivers(): Promise<Driver[]>,
    getAllTeams(): Promise<Team[]>
}
