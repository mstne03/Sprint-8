import { useDrivers } from '@/features/drivers/hooks';
import DriverCard from '@/components/DriverCard/DriverCard'

const DriverSection = () => {
    const { data: drivers } = useDrivers();

    return (
        <div className="text-white m-20 mx-15 grid md:grid-cols-2 grid-cols-1 gap-20 overflow-hidden">
            {drivers?.map((d) => (
                <DriverCard d={d}/>
            ))}
        </div>
    )
}

export default DriverSection
