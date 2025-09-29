import DriverSection from '@/components/DriverSection/DriverSection'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ConstructorSection from '@/components/ConstructorSection/ConstructorSection';
import HomeTab from '@/components/HomeTab/HomeTab';
import HeroSection from '@/components/HeroSection/HeroSection';

export default function Home () {
    const [heroSection, setHeroSection] = useState(true);
    const [seeDrivers, setSeeDrivers] = useState(true);

    return (
        <main className="py-2">
            {heroSection && (
                <HeroSection setHeroSection={setHeroSection} />
            )}
            <AnimatePresence>
                {!heroSection && (
                    <motion.div
                        key="main"
                        initial={{ opacity: 0, y: 100 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -100 }}
                        transition={{ duration: 1, ease: "easeInOut" }}
                        className="-mt-5 flex flex-col gap-5 text-white"
                    >
                        <h1 className="text-center font-extrabold text-5xl text-red-900">
                            2025 SEASON
                        </h1>
                        <HomeTab
                            seeDrivers={seeDrivers}
                            setSeeDrivers={setSeeDrivers}
                        />
                        {seeDrivers 
                            ? <DriverSection />
                            : <ConstructorSection />
                        }
                    </motion.div>
                )}
            </AnimatePresence>
        </main>
    );
}
