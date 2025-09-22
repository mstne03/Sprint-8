import { useDrivers } from '@/features/drivers/hooks'
import DriverSection from '@/components/DriverSection/DriverSection'

export default function Home () {
    const { data: drivers } = useDrivers();

    return (
        <main>
           <DriverSection />
        </main>
    )
}
