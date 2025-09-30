import { useMediaQuery } from 'react-responsive'
import { motion } from 'framer-motion'
import ReactCountryFlag from 'react-country-flag'
import type { Driver } from '@/features/drivers/types'
import CustomButton from '../CustomButton/CustomButton'
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
                background: `linear-gradient(135deg, ${d.driver_color}75 30%, #00000050 100%)`,
                borderColor: `${d.driver_color}50`
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
                    WebkitTextStroke: "2px rgba(255,255,255,0.10)",
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
                <button
                    onClick={() => setExpanded(d.full_name)}
                    className="
                        absolute text-[150%] md:left-[5%] left-[7%] top-[64.5%] 
                        bg-black/30 border-white border-2 
                        p-2 rounded-2xl hover:bg-black hover:cursor-pointer"
                >
                    <svg width="2em" height="2em" viewBox="0 0 24 24" fill="none">
                        <path d="M12 5V19" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                        <path d="M5 12H19" stroke="#fff" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg> 
                </button>
            </div>
            
            <div className="mt-5 space-y-3 absolute left-[45%] md:left-[40%] md:top-0 top-0">
                {(() => {
                    const parts = d.full_name.split(" ");
                    const beforeLast = parts.slice(0, -1).join(" ");
                    const last = parts[parts.length - 1];
                    return (
                        <div className="md:text-4xl text-[170%] flex flex-col gap-3">
                            <div className="flex gap-20">
                                <div className="flex flex-col md:gap-3 gap-1">
                                    <span className="font-light ">{beforeLast}</span>
                                    <span className="font-bold ">{last}</span>
                                </div>
                                <img
                                    className={`
                                        ${
                                            d.team_name === "Ferrari" 
                                            ? "md:min-w-[60px] md:top-[5%] md:left-[130%]"
                                            : ((d.team_name == "Mercedes") || (d.team_name == "Williams"))
                                            ? "md:left-[110%] md:top-[5%]"
                                            : "md:min-w-[100px] md:top-[5%] top-[15%] md:left-[110%] left-[110%]"
                                        }
                                        absolute
                                        min-w-[80px]
                                        w-[20%] 
                                        object-contain 
                                        
                                        
                                    `}
                                    src={`/teams/${(d.team_name || "").replace(/\s+/g, "").toLowerCase()}.svg`} 
                                    alt={`${d.team_name}`}
                                />
                            </div>
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
                    <p className="font-bold">{d.season_results.points} pts.</p>
                </div>
                
                <div className="flex gap-5 text-[10px] md:text-[70%]">
                    <div className="
                            grid grid-cols-3 gap-5
                            rounded-3xl bg-black/50 border-white/30 
                            border-2 md:p-5 p-4
                            left-[-4%] md:left-0
                            absolute min-w-[43vw] min-h-[17vh] 
                            top-[97%] md:min-w-[23vw] md:top-[98%]
                        "
                    >
                        <span>
                            <p className="">VICTORIES</p>
                            <p className="font-bold ">{d.season_results.victories}</p>
                        </span>
                        <span>
                            <p className="">POLES</p>
                            <p className="font-bold ">{d.season_results.poles}</p>
                        </span>
                        <span>
                            <p className="">PODIUMS</p>
                            <p className="font-bold ">{d.season_results.podiums}</p>
                        </span>
                        <span>
                            <p className="">AVERAGE FINISH</p>
                            <p className="font-bold ">{d.fantasy_stats.avg_finish}</p>
                        </span>
                        <span>
                            <p className="">AVERAGE GRID POS</p>
                            <p className="font-bold ">{d.fantasy_stats.avg_grid_position}</p>
                        </span>
                        <span className="space-y-1">
                            <p className="">POLE TO WIN CONVERSION</p>
                            <span className="block w-full mb-2">
                                <div className="relative h-4 rounded bg-white/50 overflow-hidden">
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
            </div>
            <div
                className="absolute md:left-[17%] left-[20%] md:top-[81%] top-[77%]"
            >
                <CustomButton 
                    text={isSelected ? "REMOVE" : "PICK"}
                    onClick={handlePickClick}
                    disabled={!canSelect}
                />
            </div>
        </motion.div>
        
    )
}

export default DriverCard
