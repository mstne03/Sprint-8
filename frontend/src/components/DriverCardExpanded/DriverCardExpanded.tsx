import { useMediaQuery } from 'react-responsive'
import { motion } from 'framer-motion'
import ReactCountryFlag from 'react-country-flag'
import type { Driver } from '@/features/drivers/types'
import CustomButton from '../ui/CustomButton/CustomButton'
import { usePicks } from '@/context/PicksContext'

type DriverCardProps = {
    d:Driver;
    setExpanded: (name: string) => void;
}

const DriverCard = ({ d, setExpanded }: DriverCardProps) =>  {
    const isDesktop = useMediaQuery({ minWidth: 768 });
    const { addDriver, removeDriver, isDriverSelected, isMaxDriversSelected } = usePicks();

    const isSelected = isDriverSelected(d.full_name);
    const canSelect = !isMaxDriversSelected || isSelected;

    const handlePickClick = () => {
        if (isSelected) {
            removeDriver(d.full_name);
        } else {
            addDriver(d);
        }
    };
    
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

            {/* Price Badge */}
            <div className="absolute top-4 right-4 bg-green-600/90 text-white px-5 py-3 rounded-full text-lg md:text-xl font-bold border-2 border-green-400/50 backdrop-blur-sm shadow-xl">
                ${(d.fantasy_stats.price / 1_000_000).toFixed(1)}M
            </div>
            
            <div className="absolute md:left-[5%] max-w-[35%] flex flex-col space-y-4">
                <div className="mt-5 space-y-3 md:left-[30%] left-[10%]">
                    {(() => {
                        const parts = d.full_name.split(" ");
                        const beforeLast = parts.slice(0, -1).join(" ");
                        const last = parts[parts.length - 1];
                        return (
                            <div className="md:text-4xl text-[170%] flex flex-col gap-3">
                                <div className="">
                                    <div className="flex gap-10 items-center">
                                        <div className="flex items-center md:gap-3 gap-3">
                                            <span className="font-light ">{beforeLast}</span>
                                            <span className="font-bold ">{last}</span>
                                        </div>
                                        <ReactCountryFlag 
                                            countryCode={d.country_code}
                                            svg
                                            className="text-[35px]"
                                        />
                                        <img
                                            className={`
                                                md:w-[20%] w-[20%] md:top-[5%] top-[5%] md:left-[80%] left-[70%]
                                                object-contain
                                                `}
                                            src={`/teams/${(d.team_name || "").replace(/\s+/g, "").toLowerCase()}.svg`} 
                                            alt={`${d.team_name}`}
                                        />
                                    </div>
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
                        flex md:gap-6 gap-5 rounded-3xl bg-black/50 border-white/30 
                        border-2 md:py-5 py-5 md:px-10 px-5 md:min-w-[13vw]
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
                        border-2 md:py-5 md:px-10 md:left-[30%] left-[40%]
                        md:min-h-[10%] px-10 py-5
                        md:min-w-[33vw]
                ">
                    <span className="space-y-3">
                        <p>OVERTAKE EFFICIENCY</p>
                        <p className="font-bold">{d.fantasy_stats.overtake_efficiency}</p>
                    </span>
                </div>

                <div className="
                        text-[10px] md:text-[85%]
                        flex gap-6 rounded-3xl bg-black/50 border-white/30 
                        border-2 md:py-5 md:px-10 px-5 py-3 md:left-[30%] left-[40%]
                        md:min-h-[10%] md:min-w-[33vw]
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
            </div>
            <div className="md:right-[7%] right-[-5%] md:max-h-[70vh] max-h-[60vh] top-[20%] md:top-[10%] overflow-hidden absolute">
                <img
                    className="md:w-[20vw] w-[40vw] relative"
                    src={`${d.headshot_url}`}
                    alt={`${d.full_name} headshot`}
                    style={{
                        WebkitMaskImage: `linear-gradient(to bottom, ${d.driver_color} 60%, transparent 83%)`,
                        WebkitMaskRepeat: "no-repeat",
                        WebkitMaskSize: isDesktop 
                            ? "100% 60%"
                            : "100% 41%",
                            maskImage: isDesktop
                            ? `linear-gradient(to bottom, ${d.driver_color} 60%, transparent 80%)`
                            : `linear-gradient(to bottom, ${d.driver_color} 60%, transparent 80%)`,
                            maskRepeat: "no-repeat",
                            maskSize: isDesktop
                            ? "100% 60%"
                            : "100% 41%",
                        }}
                />
                <button
                    onClick={() => setExpanded(d.full_name)}
                    className="
                        absolute md:text-[150%] text-[120%] md:top-[80%] 
                        top-[82.4%] md:left-[20%] left-[3%] 
                        bg-black/30 border-white border-2 
                        p-2 rounded-2xl hover:bg-black hover:cursor-pointer"
                >
                    <svg width="2em" height="2em" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12H19" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg> 
                </button>
                <span
                    className="absolute md:left-[55%] left-[15%] md:top-[82%] top-[82%]"
                >
                    <CustomButton 
                        text={isSelected ? "REMOVE" : "PICK"}
                        onClick={handlePickClick}
                        disabled={!canSelect}
                    />
                </span>
            </div>
        </motion.div>
    )
}

export default DriverCard
