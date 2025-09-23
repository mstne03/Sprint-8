import { useDrivers } from '@/features/drivers/hooks'

export default function Table() {
    const { data: drivers } = useDrivers();
    
    return (
        <div className="p-10 space-y-4">

            <div className="h-[500px] p-10">
                
            </div>
        </div>
    )
}
