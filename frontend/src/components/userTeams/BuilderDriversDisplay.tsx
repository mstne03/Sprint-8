import type { Driver } from '@/types/driverTypes';
import { motion } from 'framer-motion'
import { useTeamBuilderContext } from "@/context/TeamBuilderContext";

interface BuilderDriversDisplayProps {
    driver: Driver;
}

export const BuilderDriversDisplay = ({ driver }: BuilderDriversDisplayProps) => {
    const { selectedDrivers, handleDriverSelect, setExpandedDriver } = useTeamBuilderContext();
    
    const isSelected = selectedDrivers.find(d => d.id === driver.id);
    const canSelect = selectedDrivers.length < 3 || isSelected;

    return (
        <motion.div
            key={driver.id}
            onClick={() => canSelect && handleDriverSelect(driver)}
            className={`p-4 rounded-lg border backdrop-blur-[10px] ${
                canSelect 
                    ? 'cursor-pointer hover:backdrop-blur-[2px]'
                    : 'opacity-50 cursor-not-allowed'
            }`}
            style={{
                borderColor: isSelected 
                    ? `${driver.driver_color}`
                    : canSelect 
                        ? `${driver.driver_color}60` 
                        : "rgb(60,70,80,1)",
                backgroundColor: isSelected 
                    ? `${driver.driver_color}90`
                    : canSelect 
                        ? `${driver.driver_color}20` 
                        : "rgb(60,70,80,1)"
            }}
            whileHover={{
                borderColor: canSelect ? `${driver.driver_color}` : "rgb(60,70,80,1)",
                backgroundColor: isSelected
                    ? `${driver.driver_color}90`
                    : canSelect
                        ? `${driver.driver_color}90`
                        : "rgb(60,70,80,1)",
                scale: canSelect ? 1.02 : 1
            }}
            transition={{
                duration: 0.15,
                ease: "easeOut"
            }}
        >
            <div className="flex items-center gap-3 mb-3">
                <img 
                    src={driver.headshot_url} 
                    alt={driver.full_name}
                    className="w-12 h-12 rounded-full object-cover object-top"
                />
                <div className="text-[70%] flex-1">
                    <p className="text-white font-medium">{driver.full_name}</p>
                    <p className="text-gray-100 text-sm">{driver.team_name}</p>
                </div>
                <div 
                    onClick={(e) => {
                        e.stopPropagation();
                        setExpandedDriver(driver);
                    }}
                    className="p-2 rounded-lg bg-gray-700/60 hover:bg-gray-500/80 border border-gray-600/40 hover:border-gray-400/60 transition-all duration-150 cursor-pointer group shadow-lg hover:shadow-xl"
                >
                    <svg 
                        className="w-5 h-5 text-gray-200 group-hover:text-white transition-colors" 
                        fill="currentColor" 
                        viewBox="0 0 20 20"
                    >
                        <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                </div>
            </div>
            
            <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="text-center p-2 bg-gray-100/30 rounded">
                    <p className="text-gray-100">Points</p>
                    <p className="text-white font-bold">{driver.season_results.points}</p>
                </div>
                <div className="text-center p-2 bg-gray-100/30 rounded">
                    <p className="text-gray-100">Avg Finish</p>
                    <p className="text-white font-bold">{driver.fantasy_stats.avg_finish.toFixed(1)}</p>
                </div>
                <div className="text-center p-2 bg-green-500/70 rounded border border-green-200/50">
                    <p className="text-purple-200">Price</p>
                    <p className="text-purple-50 font-bold">${(driver.fantasy_stats.price / 1_000_000).toFixed(1)}M</p>
                </div>
            </div>
        </motion.div>
    )
}