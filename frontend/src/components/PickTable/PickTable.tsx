import type { Driver } from "@/features/drivers/types"

type PickTableProps = {
    driver: Driver | null;
    col: string;
}

const PickTable = ({ driver, col }: PickTableProps) => {

    return (
        <div className={`flex-1/3 rounded-4xl border-white/30 border-2 md:h-[30vh] md:w-[15vw] w-[70vw] mx-auto ${col}`}>
            {
                driver?.full_name
                ? <p>{driver.full_name}</p>
                : <p className="relative text-[500%] left-[42%] top-[22%] text-white/30">+</p>
            }
        </div>
    )
}

export default PickTable
