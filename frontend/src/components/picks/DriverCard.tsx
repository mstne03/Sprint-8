import type { Driver } from '@/types/driverTypes'
import { usePicks } from '@/context/PicksContext'
import PickButton from '@/components/ui/PickButton/PickButton'
import ExpandButton from '@/components/ui/ExpandButton/ExpandButton'
import StatsTable from '../ui/StatsTable/StatsTable'
import GlassCard from '@/components/ui/GlassCard/GlassCard'
import DriverInfo from '../ui/DriverInfo/DriverInfo'
import DriverImage from '../ui/DriverImage/DriverImage'

interface DriverCardProps {
    d:Driver;
    setExpanded: (name: string) => void;
}

const DriverCard = ({ d, setExpanded }: DriverCardProps) =>  {
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
        <GlassCard color={d.driver_color} motionKey={d.driver_number}>
            <span
                className={`
                    absolute md:top-[-25%] top-[-15%] text-[30vw] md:text-[20vw]
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
            <div className="absolute top-3 right-3 flex items-center gap-3 z-10">
                <div className="bg-green-600/90 text-white px-3 py-1.5 rounded-full text-sm md:text-base font-bold border-2 border-green-400/50 backdrop-blur-sm shadow-lg">
                    ${(d.fantasy_stats.price / 1_000_000).toFixed(1)}M
                </div>
            </div>
            
            <div className="space-y-5 absolute left-[8%] md:left-[5%] md:top-[5%] -top-3">
                <DriverInfo
                    key={d.id}
                    name={d.full_name}
                    country={d.country_code}
                    team={d.team_name}
                    points={d.season_results.points}
                />
                <div className="
                            flex gap-5 text-[10px] md:text-[70%] left-[-4%] md:-left-5
                            absolute min-w-[43vw] min-h-[17vh] 
                            top-[97%] md:min-w-[23vw] md:top-[100%]
                ">
                    <StatsTable
                        key={d.id}
                        season_results={d.season_results}
                        fantasy_stats={d.fantasy_stats}
                    />
                </div>
            </div>
            <div className="md:max-h-[70vh] max-h-[60vh] top-[4%] md:top-[10%] md:right-[-5%] right-[-5%] overflow-hidden absolute">
                <DriverImage
                    key={d.id}
                    url={d.headshot_url}
                    name={d.full_name}
                    color={d.driver_color}
                />
            </div>
            <div className="absolute flex items-center gap-5 bottom-3 right-3">
                <ExpandButton key={d.id} onClick={() => setExpanded(d.full_name)} />
                <PickButton
                    key={d.id}
                    isSelected={isSelected}
                    onClick={handlePickClick}
                    disabled={!canSelect}
                />
            </div>
        </GlassCard>
    )
}

export default DriverCard
