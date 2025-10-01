import type { Team } from "@/features/teams/types"
import type { Driver } from "@/features/drivers/types"
import { motion } from 'framer-motion'
import { usePicks } from '@/context/PicksContext'
import PickButton from "../ui/PickButton/PickButton"

type ConstructorCardProps = {
    t: Team;
    d: Driver[] | undefined;
}

const ConstructorCard = ({ t, d }: ConstructorCardProps) => {
    const drivers = d?.filter(driver => driver.team_name === t.team_name)
    const points = drivers?.reduce((total, driver) => total + (driver.season_results?.points || 0), 0) || 0
    
    const { selectedConstructor, setSelectedConstructor } = usePicks();
    
    const isSelected = selectedConstructor === t.team_name;
    
    const handlePickClick = () => {
        if (isSelected) {
            setSelectedConstructor(null);
        } else {
            setSelectedConstructor(t.team_name);
        }
    };

    return (
        <motion.div className={`
                flex items-center relative md:min-h-[60vh]
                min-h-[55vh] min-w-[50vw] md:min-w-[20vw]
                overflow-hidden rounded-4xl border-4 p-2
            `}
            key={t.team_name}
            style={{ 
                background: `linear-gradient(135deg, ${t.team_color}75 30%, #00000050 100%)`,
                borderColor: `${t.team_color}50`
            }}
        >
            <div className="mt-10 space-y-3 absolute left-[45%] md:left-[8%] md:top-0 top-0">
                <div className="md:text-4xl text-[170%] flex gap-5">
                    <div className="flex flex-col md:gap-3 gap-1 md:max-w-[55%]">
                        <span className="font-bold text-white">{t.team_name}</span>
                        <p className="text-white text-[20px]">CHAMPIONSHIP</p>
                        <p className="font-bold text-white text-[20px]">{points} pts.</p>
                    </div>
                </div>
            </div>
            <div className="absolute md:left-[35%] md:top-13 md:max-w-[10%]">
                <img
                    className=""
                    src={`/teams/${(t.team_name || "").replace(/\s+/g, "").toLowerCase()}.svg`} 
                    alt="" 
                />
            </div>
            <div className="absolute md:bottom-5 md:left-15">
                <img
                    className="md:min-w-[30vw] w-[25%] object-contain"
                    src={t.team_url}
                    alt={`${t.team_name} img`}
                />
            </div>
            <div className="absolute bottom-4 right-4">
                <PickButton
                    isSelected={isSelected}
                    onClick={handlePickClick}
                    disabled={false}
                />
            </div>
        </motion.div>
    )
}

export default ConstructorCard
