import type { Team } from "@/features/teams/types"
import type { Driver } from "@/features/drivers/types"
import { motion } from 'framer-motion'
import { usePicks } from '@/context/PicksContext'
import CustomButton from '../ui/CustomButton/CustomButton'

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
            <div className="mt-5 space-y-3 absolute left-[45%] md:left-[8%] md:top-0 top-0">
                <div className="md:text-4xl text-[170%] flex flex-col gap-3">
                    <div className="flex gap-15 items-center">
                        <div className="flex flex-col md:gap-3 gap-1">
                            <span className="font-bold text-white">{t.team_name}</span>
                        </div>
                        <img
                            className="md:w-[55%] w-[25%] object-contain"
                            src={t.team_url}
                            alt={`${t.team_name} img`}
                        />
                    </div>
                    <div className="md:text-[20px] space-y-2">
                        <p className="text-white">CHAMPIONSHIP</p>
                        <p className="font-bold text-white">{points} pts.</p>
                    </div>
                </div>
            </div>
            
            {/* Pick Button */}
            <div className="absolute bottom-4 right-4">
                <CustomButton 
                    onClick={handlePickClick}
                    disabled={false}
                >
                    {isSelected ? "REMOVE" : "PICK"}
                </CustomButton>
            </div>
        </motion.div>
    )
}

export default ConstructorCard
