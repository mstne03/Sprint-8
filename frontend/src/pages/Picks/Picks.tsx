import PickTable from '@/components/PickTable/PickTable'
import Table from '@/components/Table/Table'
import { useDrivers } from '@/features/drivers/hooks'
import { useDriversService } from '@/providers/DriversProvider'
import { useEffect } from 'react'

const Picks = () => {
    const {
       selectedRows,
       setSelectedRows
    } = useDriversService()

    const { data: drivers } = useDrivers();

    useEffect(() => {
        return () => {
            setSelectedRows([]);
        }
    }, []);

    return (
        <main className="flex flex-col gap-7 p-10 md:h-[85.45vh] h-[96vh] text-white">
            <div className="flex-1/6 min-h-[520px] md:min-h-[520px] min-w-[40vw]">
                <Table />
            </div>
            <div className="flex-1/2 space-y-6 md:h-[90vh]">
                <p className="font-bold text-3xl text-center">Your picks</p>

                <div className="flex md:flex-row flex-col justify-center gap-3">
                    {[0, 1, 2].map(i => {
                        const r = selectedRows[i];
                        const driver = (r && drivers?.find(d => d.full_name === r.data.driver.name)) || null;
                        return (
                            <PickTable 
                                key={i} 
                                driver={driver} 
                                col={i === 2 
                                    ? "col-span-2" 
                                    : ""}
                            />
                        )
                    })}
                </div>
            </div>
        </main>
    )
}

export default Picks
