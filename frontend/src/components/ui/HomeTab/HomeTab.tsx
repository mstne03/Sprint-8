import { motion } from 'framer-motion'

type HomeTabProps = {
    seeDrivers: boolean;
    setSeeDrivers: (arg:boolean) => void;
}

const HomeTab = ({ seeDrivers, setSeeDrivers }: HomeTabProps) => {
    return (
        <div className="relative text-center self-center bg-red-700 md:max-w-[55%] rounded-[28px] p-1">
            <div className="flex w-full h-full relative">
                <motion.div
                    layoutId="tab-indicator"
                    className="absolute top-0 w-1/2 h-full rounded-3xl bg-slate-900/50 z-0"
                    animate={{ 
                        x: seeDrivers ? 0 : '100%' 
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
                <button 
                    className={`
                        hover:cursor-pointer
                        relative z-10 w-1/2 py-3 px-4 rounded-3xl 
                        flex items-center justify-center
                        font-bold transition-colors duration-200
                        ${seeDrivers ? "text-white font-bold" : "text-white/70 hover:text-white"}
                    `}
                    onClick={() => setSeeDrivers(true)}
                >
                    Drivers
                </button>
                <button 
                    className={`
                        hover:cursor-pointer
                        relative z-10 w-1/2 py-3 px-10 rounded-3xl 
                        flex items-center justify-center
                        font-bold transition-colors duration-200
                        ${!seeDrivers ? "text-white font-bold" : "text-white/70 hover:text-white"}
                    `}
                    onClick={() => setSeeDrivers(false)}
                >
                    Constructors
                </button>
            </div>
        </div>
    )
}

export default HomeTab
