import { motion } from 'framer-motion'

type HomeTabProps = {
    seeDrivers: boolean;
    setSeeDrivers: (arg:boolean) => void;
}

const HomeTab = ({ seeDrivers, setSeeDrivers }: HomeTabProps) => {
    return (
        <div className="relative text-center self-center space-x-5 px-3 py-5 bg-red-700 md:max-w-[55%] rounded-[28px]">
                <div className="absolute p-1 top-0 left-0 w-full h-full pointer-events-none">
                    <div className="flex w-full h-full relative">
                        <span className="w-1/2 h-full relative">
                            {seeDrivers && (
                                <motion.div
                                    layoutId="tab-indicator"
                                    className="absolute left-0 top-0 w-full h-full rounded-3xl bg-slate-900/50"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </span>
                        <span className="w-1/2 h-full relative">
                            {!seeDrivers && (
                                <motion.div
                                    layoutId="tab-indicator"
                                    className="absolute left-0 top-0 w-full h-full rounded-3xl bg-slate-900/50"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </span>
                    </div>
                </div>
                <span 
                    className={`hover:cursor-pointer px-20 py-5 rounded-3xl relative z-10 ${seeDrivers ? "text-white font-bold" : ""}`}
                    onClick={() => setSeeDrivers(true)}
                >Drivers</span>
                <span 
                    className={`hover:cursor-pointer px-20 py-5 rounded-3xl relative z-10 ${!seeDrivers ? "text-white font-bold" : ""}`}
                    onClick={() => setSeeDrivers(false)}
                >Constructors</span>
            </div>
    )
}

export default HomeTab
