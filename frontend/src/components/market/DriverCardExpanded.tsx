import type { DriverWithOwnership } from '@/types/marketTypes'
import { GlassCard } from '@/components/ui'
import { DriverInfo } from '@/components/ui'
import { DriverImage } from '@/components/ui'
import { DriverStatsCharts } from '@/components/ui'
import { formatCurrencyPrecise } from '@/utils/currencyFormat'

interface DriverCardProps {
    d:DriverWithOwnership;
    setExpanded: (name: string) => void;
}

export const DriverCardExpanded = ({ d, setExpanded }: DriverCardProps) =>  {
    
    return (
        <GlassCard
            color={d.driver_color}
            motionKey={d.driver_number}
            className="flex flex-col gap-5 rounded-4xl border-4 p-2"
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
        >
            <span
                className={`
                    absolute md:top-[-10%] top-[-15%] text-[30vw] md:text-[30vw]
                    ${d.driver_number.toString().length > 1
                        ? "md:left-[40%] left-[50%]"
                        : "md:left-[40%] left-[50%]"}
                    pointer-events-none select-none
                `}
                style={{
                    WebkitTextStroke: "2px rgba(255,255,255,0.10)",
                    color: "transparent",
                }}
            >
                {d.driver_number}
            </span>
            <div className="absolute top-4 right-4 bg-green-600/90 text-white px-5 py-3 rounded-full text-lg md:text-xl font-bold border-2 border-green-400/50 backdrop-blur-sm shadow-xl">
                {formatCurrencyPrecise(d.fantasy_stats?.price || 0)}
            </div>
            <div className="flex gap-10 md:ms-0 mt-5">
                <DriverImage
                    key={d.id}
                    url={d.headshot_url}
                    name={d.full_name}
                    color={d.driver_color}
                    expanded={true}
                />
                <div className="md:ms-30">
                    <DriverInfo
                        key={d.id}
                        name={d.full_name}
                        country={d.country_code || ''}
                        team={d.team_name || ''}
                        points={d.season_results?.points || 0}
                        expanded={true}
                    />
                </div>
            </div>
            <div className="w-full">
                {d.season_results && d.fantasy_stats && (
                    <DriverStatsCharts
                        key={d.id}
                        season_results={d.season_results}
                        fantasy_stats={d.fantasy_stats}
                    />
                )}
            </div>
            <div className="absolute flex items-center gap-5 bottom-3 right-3">
                <div 
                    onClick={() => setExpanded(d.full_name)}
                    className="p-2 rounded-lg bg-gray-700/50 hover:bg-gray-600/70 transition-all duration-150 cursor-pointer group"
                >
                    <svg 
                        className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors" 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth={2} 
                            d="M6 18L18 6M6 6l12 12" 
                        />
                    </svg>
                </div>
            </div>
        </GlassCard>
    )
}
