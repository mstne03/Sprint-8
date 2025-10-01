import DriverSection from '@/components/DriverSection/DriverSection'
import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import ConstructorSection from '@/components/ConstructorSection/ConstructorSection';
import HomeTab from '@/components/ui/HomeTab/HomeTab';
import PickSideBar from '@/components/PickSideBar/PickSideBar';

const PicksContent = () => {
    const [seeDrivers, setSeeDrivers] = useState(true);

    return (
        <main className="py-10">
            <AnimatePresence>
                <motion.div
                    key="main"
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -100 }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="-mt-5 text-white"
                >
                    <div className="flex md:flex-row flex-col-reverse gap-6 min-h-screen">
                        <div className="flex flex-col gap-5 md:w-[65%]">
                            <h1 className="text-center font-bold text-5xl text-white">
                                YOUR PICKS
                            </h1>
                            <HomeTab
                                seeDrivers={seeDrivers}
                                setSeeDrivers={setSeeDrivers}
                            />
                            {seeDrivers 
                                ? <DriverSection />
                                : <ConstructorSection />
                            }
                        </div>
                        <div className="flex justify-center w-[100%] md:w-[35%] md:sticky top-4 me-15 md:h-fit">
                            <PickSideBar />
                        </div>
                    </div>
                </motion.div>
            </AnimatePresence>
        </main>
    );
};

export default PicksContent
