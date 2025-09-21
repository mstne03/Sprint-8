import { http } from '@/shared/axios'
import type { DataService } from '@/features/drivers/service'
import type { Driver } from '@/features/drivers/types'

export const driverService: DataService = {
    async getAllDrivers() {
        const { data } = await http.get("/drivers/")

        return data.filter((d:Driver) => d.headshot_url != "None") as Driver[]
    }
}
