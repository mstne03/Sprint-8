import { useDrivers } from '@/features/drivers/hooks'
import DriverCard from '@/components/DriverCard/DriverCard'

export default function Home () {
    const { data: drivers } = useDrivers();

    return (
        <main>
           <DriverCard 
                drivers={drivers}
           />
        </main>
    )
}
