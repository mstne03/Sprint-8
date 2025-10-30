import type { Driver } from '@/features/Market/types/marketTypes'
import type { Team } from '@/core/types'

export type F1DataService = {
    getAllDrivers(): Promise<Driver[]>,
    getAllTeams(): Promise<Team[]>
}
