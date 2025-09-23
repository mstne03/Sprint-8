import { useMediaQuery } from 'react-responsive'
import { motion } from 'framer-motion'
import ReactCountryFlag from 'react-country-flag'
import type { Driver } from '@/features/drivers/types'

type DriverCardProps = {
    d:Driver
}

const DriverCard = ({ d }: DriverCardProps) =>  {
    const isDesktop = useMediaQuery({ minWidth: 768 });

    return (
        <motion.div
            className={`
                flex
                items-center
                relative
                md:min-h-[60vh]
                min-h-[55vh]
                min-w-[50vw]
                md:min-w-[20vw]
                overflow-hidden
                rounded-4xl
                border-4
                p-2
            `}
            key={d.driver_number}
            style={{ 
                background: `linear-gradient(135deg, ${d.driver_color}40 0%, #80808025 100%)`,
                borderColor: `${d.driver_color}30`
            }}
        >
            <span
                className={`
                    absolute 
                    md:top-[-25%]
                    top-[-15%]
                    text-[30vw]
                    md:text-[20vw]
                    ${d.driver_number.toString().length > 1
                        ? "md:left-[40%] left-[50%]"
                        : "md:left-[65%] left-[65%]"
                    }
                    pointer-events-none
                    select-none
                `}
                style={{
                    WebkitTextStroke: "2px rgba(255,255,255,0.07)",
                    color: "transparent",
                }}
            >
                {d.driver_number}
            </span>
            <div className="md:max-h-[70vh] max-h-[60vh] top-[4%] md:top-[3%] overflow-hidden absolute">
                <img
                    className="md:w-[20vw] w-[45vw] left-[-20%] md:left-[-15%] relative"
                    src={`${d.headshot_url}`}
                    alt={`${d.full_name} headshot`}
                    style={{
                        WebkitMaskImage: `linear-gradient(to bottom, ${d.driver_color} 60%, transparent 83%)`,
                        WebkitMaskRepeat: "no-repeat",
                        WebkitMaskSize: isDesktop 
                            ? "100% 48%"
                            : "100% 41%",
                        maskImage: isDesktop
                            ? `linear-gradient(to bottom, ${d.driver_color} 60%, transparent 80%)`
                            : `linear-gradient(to bottom, ${d.driver_color} 60%, transparent 80%)`,
                        maskRepeat: "no-repeat",
                        maskSize: isDesktop
                            ? "100% 48%"
                            : "100% 41%",
                    }}
                />
            </div>
            <div className="mt-5 space-y-3 absolute left-[45%] md:left-[40%] md:top-0 top-0">
                {(() => {
                    const parts = d.full_name.split(" ");
                    const beforeLast = parts.slice(0, -1).join(" ");
                    const last = parts[parts.length - 1];
                    return (
                        <div className="text-4xl flex flex-col gap-3">
                            <span className="font-light ">{beforeLast}</span>
                            <span className="font-bold ">{last}</span>
                            <span className="text-[15px]">
                                <ReactCountryFlag 
                                    countryCode={d.country_code}
                                    svg
                                    className="text-[35px]"
                                />
                            </span>
                        </div>
                    );
                })()}

                <div className="md:text-[20px]">
                    <p>CHAMPIONSHIP</p>
                    <p className="font-bold">{d.points} pts.</p>
                </div>
                
                <div className="flex gap-5 text-[10px] md:text-[70%]">
                    <div className="
                            grid grid-cols-3 gap-5 
                            rounded-3xl bg-white/20 border-white/30 
                            border-0 md:p-5 p-4
                            left-[-4%] md:left-0
                            absolute min-w-[43vw] min-h-[17vh] 
                            top-[101%] md:min-w-[23vw] md:top-[100%]
                    " >
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
                        <span>
                            <p className="">SPRINT POLES</p>
                            <p className="font-bold ">{d.sprint_poles}</p>
                        </span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default DriverCard
