import { useDrivers } from '@/features/drivers/hooks';
import DriverCard from '@/components/DriverCard/DriverCard'
import { useState } from 'react';
import DriverCardExpanded from '../DriverCardExpanded/DriverCardExpanded';
import { AnimatePresence, motion } from 'framer-motion';

const DriverSection = () => {
    const { data: drivers } = useDrivers();
    const [expanded, setExpanded] = useState<string | null>(null);

    return (
        <section>
            <div className="text-white mx-15 grid md:grid-cols-2 grid-cols-1 gap-10 overflow-hidden">
                {drivers?.map((d) => (
                    <>
                        <DriverCard
                            key={d.full_name} 
                            d={d}
                            setExpanded={() => setExpanded(d.full_name)}
                        />
                        <AnimatePresence>
                            {expanded === d.full_name && (
                                <>
                                    <motion.div
                                        className="fixed inset-0 w-screen h-screen bg-black/95 z-40"
                                        style={{ pointerEvents: 'auto' }}
                                        onClick={() => setExpanded(null)}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    />
                                    <DriverCardExpanded
                                        key={d.full_name} 
                                        d={d}
                                        setExpanded={() => setExpanded(null)}
                                    />
                                </>
                            )}
                        </AnimatePresence>
                    </>
                ))}
            </div>
        </section>
    )
}

export default DriverSection
