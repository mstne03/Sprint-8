import { http } from '@/services'
import type { F1DataService } from '@/types/f1DataService'
import type { Driver } from '@/types/marketTypes'
import type { Team } from '@/types/teamsTypes'

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