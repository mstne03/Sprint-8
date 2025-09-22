import { motion } from 'framer-motion'
import ReactCountryFlag from 'react-country-flag'
import type { Driver } from '@/features/drivers/types'

type DriverCardProps = {
    d:Driver
}

const DriverCard = ({ d }: DriverCardProps) =>  {
    return (
        <motion.div
                    className={`
                        flex
                        items-center
                        relative
                        md:min-h-[55vh]
                        min-h-[50vh]
                        min-w-[50vw]
                        md:min-w-[20vw]
                        overflow-hidden
                        rounded-4xl
                        border-2
                        border-[rgba(255,255,255,0.05)]
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
                            md:text-[20vw]
                            md:left-[40%]
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
                    <div className="md:max-h-[40vh] max-h-[35vh] top-[4%] md:top-[3%] overflow-hidden absolute">
                        <img
                            className="md:w-[30vw] w-[45vw] left-[-5%] md:left-[-20%] relative"
                            src={`${d.headshot_url}`}
                            alt={`${d.full_name} headshot`}
                        />
                    </div>
                    <div className="mt-5 text-right space-y-10 absolute left-[30%] md:left-[3%] md:top-[5%]">
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

                        <div className="text-[2vw]">
                            <p>CHAMPIONSHIP</p>
                            <p className="font-bold">{d.points} pts.</p>
                        </div>
                        
                        <div className="flex gap-5 text-[10px] md:text-[70%]">
                            <span>
                                <p className="">NATIONALITY</p>
                                <ReactCountryFlag 
                                    countryCode={d.country_code}
                                    svg
                                    className="text-[35px]"
                                />
                            </span>
                            <span>
                                <p className="">VICTORIES</p>
                                <p className="font-bold ">{d.victories}</p>
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
                            <span>
                                <p className="">SPRINT VICTORIES</p>
                                <p className="font-bold ">{d.sprint_victories}</p>
                            </span>
                        </div>
                    </div>
                </motion.div>
    )
}

export default DriverCard
