import { http } from '@/core/services'
import type { F1DataService, Team } from '@/core/types'
import type { Driver } from '@/features/Market/types/marketTypes'

export const f1DataService: F1DataService = {
    async getAllDrivers() {
        const { data } = await http.get("/drivers/")

        return data.filter((d:Driver) => d.headshot_url != "None") as Driver[]
    },

    async getAllTeams() {
        const { data } = await http.get("/teams/")

        return data as Team[]
    }
}