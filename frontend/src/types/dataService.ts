import type { Driver } from '@/features/drivers/types'
import type { Team } from '@/features/teams/types'

export type DataService = {
    getAllDrivers(): Promise<Driver[]>,
    getAllTeams(): Promise<Team[]>
}