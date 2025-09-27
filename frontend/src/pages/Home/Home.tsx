import DriverSection from '@/components/DriverSection/DriverSection'
import { useState } from 'react'
import { motion } from 'framer-motion'
import ConstructorSection from '@/components/ConstructorSection/ConstructorSection';

export default function Home () {
    const [seeDrivers, setSeeDrivers] = useState(true);

    return (
        <main className="mt-10 flex flex-col gap-10 text-white">
            <h1 className="text-center text-white font-medium text-4xl">
                2025 SEASON
            </h1>
            <div className="relative text-center self-center space-x-10 p-5 bg-white/30 max-w-[50%] rounded-[28px]">
                <div className="absolute p-1 top-0 left-0 w-full h-full pointer-events-none">
                    <div className="flex w-full h-full relative">
                        <span className="w-1/2 h-full relative">
                            {seeDrivers && (
                                <motion.div
                                    layoutId="tab-indicator"
                                    className="absolute left-0 top-0 w-full h-full rounded-3xl bg-red-500"
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
                                    className="absolute left-0 top-0 w-full h-full rounded-3xl bg-red-500"
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
           {
                seeDrivers 
                ? <DriverSection />
                : <ConstructorSection />
            }
        </main>
    )
}
