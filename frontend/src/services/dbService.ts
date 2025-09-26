import { http } from '@/services/axios'
import type { DataService } from '@/types/dataService'
import type { Driver } from '@/features/drivers/types'
import type { Team } from '@/features/teams/types'

export const dataService: DataService = {
    async getAllDrivers() {
        const { data } = await http.get("/drivers/")

        return data.filter((d:Driver) => d.headshot_url != "None") as Driver[]
    },

    async getAllTeams() {
        const { data } = await http.get("/teams/")

        return data as Team[]
    }
}
