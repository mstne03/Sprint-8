import { useMediaQuery } from 'react-responsive'
import { motion } from 'framer-motion'
import ReactCountryFlag from 'react-country-flag'
import type { Driver } from '@/features/drivers/types'

type DriverCardProps = {
    d:Driver;
    setExpanded: (name: string) => void;
}

const DriverCard = ({ d, setExpanded }: DriverCardProps) =>  {
    const isDesktop = useMediaQuery({ minWidth: 768 });
    
    return (
        <motion.div
            initial={{
                opacity: 0,
                scale: 0.7,
                borderRadius: "2rem",
                boxShadow: "0 0 0px #0000",
                position: "fixed",
                top: "50%",
                left: "50%",
                width: "40vw",
                height: "40vh",
                zIndex: 50,
                translateX: "-50%",
                translateY: "-50%",
            }}
            animate={{
                opacity: 1,
                scale: 1,
                borderRadius: "2rem",
                boxShadow: "0 0 40px #0008",
                position: "fixed",
                top: "50%",
                left: "50%",
                width: "80vw",
                height: "80vh",
                zIndex: 50,
                translateX: "-50%",
                translateY: "-50%",
            }}
            exit={{
                opacity: 0,
                scale: 0.7,
                boxShadow: "0 0 0px #0000",
                position: "fixed",
                width: "40vw",
                height: "40vh",
            }}
            transition={{ type: "spring", stiffness: 150, damping: 30 }}
            className={`
                flex
                items-center
                relative
                overflow-hidden
                rounded-4xl
                border-4
                p-2
            `}
            key={d.driver_number}
            style={{ 
                background: `linear-gradient(135deg, ${d.driver_color}70 0%, #80808025 100%)`,
                borderColor: `${d.driver_color}30`
            }}
        >
            <span
                className={`
                    absolute
                    text-[50vw]
                    md:text-[40vw]
                    left-[15%]
                    pointer-events-none
                    select-none
                `}
                style={{
                    WebkitTextStroke: "2px rgba(255,255,255,0.10)",
                    color: "transparent",
                }}
            >
                {d.driver_number}
            </span>
            <div className="md:left-[11%] md:max-h-[70vh] max-h-[60vh] top-[4%] md:top-[10%] overflow-hidden absolute">
                <img
                    className="md:w-[20vw] w-[45vw] relative"
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
            
            <div className="
                    absolute border-2 
                    border-white/50 rounded-2xl 
                    py-5 px-10 bg-black/50
                    left-[18.5%] top-[77.5%]
            ">
                <p className="font-bold">Price</p>
                {`${(d.fantasy_stats.price / 1_000_000).toFixed(2)}M`}
                <span className="text-green-400">$</span>
            </div>

            <button
                onClick={() => setExpanded(d.full_name)}
                className="
                    absolute text-[150%] top-[80%] left-[3%] 
                    bg-black/66 border-white/30 border-2 
                    p-2 rounded-2xl hover:bg-black hover:cursor-pointer"
            >
                <svg width="2em" height="2em" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12H19" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                </svg> 
            </button>
            
            <img
                className={`
                    md:w-[10%] md:top-[15%] top-[15%] md:left-[3%] left-[-80%]
                    absolute object-contain
                `}
                src={`/teams/${(d.team_name || "").replace(/\s+/g, "").toLowerCase()}.svg`} 
                alt={`${d.team_name}`}
            />

            <div className="mt-5 space-y-3 absolute left-[45%] md:left-[40%] md:top-[5%] top-0">
                {(() => {
                    const parts = d.full_name.split(" ");
                    const beforeLast = parts.slice(0, -1).join(" ");
                    const last = parts[parts.length - 1];
                    return (
                        <div className="md:text-4xl text-[170%] flex flex-col gap-3">
                            <div className="flex gap-5 items-center">
                                <div className="flex md:gap-3 gap-3">
                                    <span className="font-light ">{beforeLast}</span>
                                    <span className="font-bold ">{last}</span>
                                </div>
                                <ReactCountryFlag 
                                    countryCode={d.country_code}
                                    svg
                                    className="text-[35px]"
                                />
                            </div>
                            <span className="text-[15px] flex gap-4">
                                <p>CHAMPIONSHIP</p>
                                <p className="font-bold">{d.season_results.points} pts.</p>
                            </span>
                        </div>
                    );
                })()}
            </div>

            <div className="
                    text-[10px] md:text-[85%]
                    flex gap-10 rounded-3xl bg-black/50 border-white/30 
                    border-2 md:py-5 md:px-10 md:left-[35%]
                    absolute md:min-h-[20%]
                    md:min-w-[33vw] md:top-[25%]
                    ">
                <span className="space-y-3">
                    <p className="">VICTORIES</p>
                    <p className="font-bold ">{d.season_results.victories}</p>
                </span>
                <span className="space-y-3">
                    <p className="">POLES</p>
                    <p className="font-bold ">{d.season_results.poles}</p>
                </span>
                <span className="space-y-3">
                    <p className="">PODIUMS</p>
                    <p className="font-bold ">{d.season_results.podiums}</p>
                </span>
                <span className="space-y-3">
                    <p className="">AVERAGE FINISH</p>
                    <p className="font-bold ">{d.fantasy_stats.avg_finish}</p>
                </span>
            </div>

            <div className="
                    text-[10px] md:text-[85%]
                    flex gap-10 rounded-3xl bg-black/50 border-white/30 
                    border-2 md:py-5 md:px-10 md:left-[45%]
                    absolute md:min-h-[20%]
                    md:min-w-[33vw] md:top-[50%]
            ">
                <span className="space-y-3">
                    <p>OVERTAKE EFFICIENCY</p>
                    <p className="font-bold">{d.fantasy_stats.overtake_efficiency}</p>
                </span>
            </div>

            <div className="
                    text-[10px] md:text-[85%]
                    flex gap-10 rounded-3xl bg-black/50 border-white/30 
                    border-2 md:py-5 md:px-10 md:left-[55%]
                    absolute md:min-h-[20%]
                    md:min-w-[33vw] md:top-[74%]
            ">
                <span className="space-y-3">
                    <p className="">AVAILABLE POINTS %</p>
                    <span className="block w-full mb-2">
                        <div className="relative h-4 rounded bg-white/50 overflow-hidden max-w-[200px]">
                            <div
                            className="absolute left-0 top-0 h-4 bg-green-500"
                            style={{ width: `${d.fantasy_stats.available_points_percentatge}%` }}
                            />
                            <span className="absolute left-1 top-0 text-xs text-black">{d.fantasy_stats.available_points_percentatge}%</span>
                        </div>
                    </span>
                </span>
                <span className="space-y-3">
                    <p className="">POLE TO WIN CONVERSION</p>
                    <span className="block w-full mb-2">
                        <div className="relative h-4 rounded bg-white/50 overflow-hidden max-w-[200px]">
                            <div
                            className="absolute left-0 top-0 h-4 bg-green-500"
                            style={{ width: `${d.fantasy_stats.pole_win_conversion}%` }}
                            />
                            <span className="absolute left-1 top-0 text-xs text-black">{d.fantasy_stats.pole_win_conversion}%</span>
                        </div>
                    </span>
                </span>
            </div>
        </motion.div>
        
    )
}

export default DriverCard
