import type { Team } from '@/types/teamsTypes';
import { motion } from 'framer-motion'
import { useTeamBuilderContext } from "@/context/TeamBuilderContext";

interface BuilderConstructorsDisplayProps {
    constructor: Team;
}

export const BuilderConstructorsDisplay = ({ constructor }: BuilderConstructorsDisplayProps) => {
    const { selectedConstructor, handleConstructorSelect } = useTeamBuilderContext();
    
    const isSelected = selectedConstructor?.id === constructor.id;

    return (
        <motion.div
            key={constructor.id}
            onClick={() => handleConstructorSelect(constructor)}
            className={`p-4 rounded-lg border cursor-pointer ${
                isSelected 
                    ? 'border-green-500 bg-green-600/20' 
                    : 'border-gray-600 bg-gray-700/30'
            }`}
            style={{
                borderColor: isSelected 
                    ? `${constructor.team_color}`
                    : `${constructor.team_color}30`,
                backgroundColor: isSelected 
                    ? `${constructor.team_color}60`
                    : `${constructor.team_color}10`
            }}
            whileHover={{
                borderColor: `${constructor.team_color}`,
                backgroundColor: isSelected
                    ? `${constructor.team_color}70`
                    : `${constructor.team_color}40`,
                scale: 1.02
            }}
            transition={{
                duration: 0.15,
                ease: "easeOut"
            }}
        >
            <div className="flex items-center gap-3 mb-3">
                <img 
                    src={`/teams/${constructor.team_name.toLowerCase().replace(/\s/g, "")}.svg`}
                    alt={`${constructor.team_name}`}
                    className="max-w-[10%]"
                />
                <div>
                    <p className="text-white font-medium">{constructor.team_name}</p>
                    <p className="text-gray-400 text-sm">{constructor.season_results?.points || 0} points</p>
                </div>
            </div>
        </motion.div>
    )
}