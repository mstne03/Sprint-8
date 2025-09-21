import type { Driver } from './types'

export type DataService = {
    getAllDrivers(): Promise<Driver[]>
}
