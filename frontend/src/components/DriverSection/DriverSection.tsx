import { useDrivers } from '@/features/drivers/hooks';
import DriverCard from '@/components/DriverCard/DriverCard'

const DriverSection = () => {
    const { data: drivers } = useDrivers();

    return (
        <section>
            <h1 className="text-center text-white font-medium text-4xl">
                2025 DRIVER STANDINGS
            </h1>
            <div className="text-white my-10 mx-15 grid md:grid-cols-2 grid-cols-1 gap-10 overflow-hidden">
                {drivers?.map((d) => (
                    <DriverCard d={d}/>
                ))}
            </div>
        </section>
    )
}

export default DriverSection
