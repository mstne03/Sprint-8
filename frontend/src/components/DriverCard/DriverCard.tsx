import type { Driver } from '@/features/drivers/types'
import { motion } from 'framer-motion'
import ReactCountryFlag from 'react-country-flag'

interface DriverCardProps {
    drivers?: Driver[]
}

const DriverCard = ({ drivers }: DriverCardProps) => {

    return (
        <div className="text-white m-20 mx-15 grid md:grid-cols-2 grid-cols-1 gap-20 overflow-hidden">
            {drivers?.map((d) => (
                <motion.div
                    className={`
                        flex
                        items-center
                        relative
                        md:min-h-[70vh]
                        min-h-[50vh]
                        min-w-[50vw]
                        md:min-w-[20vw]
                        overflow-hidden
                        rounded-4xl
                        border-2
                        border-[rgba(255,255,255,0.05)]
                        hover:cursor-pointer
                        p-2
                    `}
                    key={d.driver_number}
                    style={{ backgroundColor: `${d.driver_color}25`}}
                >
                    <span
                        className="
                            absolute 
                            top-[0.05%] 
                            left-[55%] 
                            text-[30vw]
                            md:left-[20%]
                            pointer-events-none
                            select-none
                        "
                        style={{
                            WebkitTextStroke: '2px rgba(255,255,255,0.05)',
                            color: 'transparent',
                        }}
                    >
                        {d.driver_number}
                    </span>
                    <div className="md:max-h-[40vh] max-h-[20vh] overflow-hidden">
                        <img
                            className="w-[30vw] left-[-6%] md:left-[-20%] relative"
                            src={`${d.headshot_url}`}
                            alt={`${d.full_name}`}
                        />
                    </div>
                    <div className="mt-5 space-y-10 absolute left-[43%] top-[7%]">
                        {(() => {
                            const parts = d.full_name.split(" ");
                            const beforeLast = parts.slice(0, -1).join(" ");
                            const last = parts[parts.length - 1];
                            return (
                                <div className="text-4xl flex flex-col gap-3">
                                    <span className="font-light ">{beforeLast}</span>
                                    <span className="font-bold ">{last}</span>
                                </div>
                            );
                        })()}

                        <div className="">
                            <p>CHAMPIONSHIP</p>
                            <p className="font-bold">{d.points} pts.</p>
                        </div>
                        
                        <div className="flex gap-5 text-[10px] md:text-[75%]">
                            <span>
                                <p className="">NATIONALITY</p>
                                <ReactCountryFlag 
                                    countryCode={d.country_code}
                                    svg
                                    className="text-[35px]"
                                />
                            </span>
                            <span>
                                <p className="">POLES</p>
                                <p className="font-bold ">{d.poles}</p>
                            </span>
                            <span>
                                <p className="">PODIUMS</p>
                                <p className="font-bold ">{d.podiums}</p>
                            </span>
                            <span>
                                <p className="">FASTEST LAPS</p>
                                <p className="font-bold ">{d.fastest_laps}</p>
                            </span>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
    )
}

export default DriverCard
