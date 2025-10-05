import { useDrivers } from '@/hooks/drivers';
import DriverCard from '@/components/picks/DriverCard'
import { useState } from 'react';
import DriverCardExpanded from './DriverCardExpanded';
import { AnimatePresence, motion } from 'framer-motion';
import LoadingSpinner from '@/components/ui/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage/ErrorMessage';
import EmptyState from '@/components/ui/EmptyState/EmptyState';

const DriverSection = () => {
    const { data: drivers, isLoading, isError, error } = useDrivers();
    const [expanded, setExpanded] = useState<string | null>(null);

    if (isLoading) {
        return (
            <section>
                <LoadingSpinner message="Loading drivers..." />
            </section>
        );
    }

    if (isError) {
        return (
            <section>
                <ErrorMessage 
                    error={error as Error} 
                    title="Error loading drivers"
                />
            </section>
        );
    }

    if (!drivers || drivers.length === 0) {
        return (
            <section>
                <EmptyState 
                    title="No drivers found"
                    description="No driver data is currently available."
                />
            </section>
        );
    }

    return (
        <div className="text-white mx-5 grid md:grid-cols-1 grid-cols-1 gap-7 overflow-hidden">
            {drivers.map((d) => (
                <div key={d.id}>
                    <DriverCard
                        key={d.id} 
                        d={d}
                        setExpanded={() => setExpanded(d.full_name)}
                    />
                    <AnimatePresence>
                        {expanded === d.full_name && (
                            <div key={d.id}>
                                <motion.div
                                    key={d.full_name}
                                    className="fixed inset-0 w-screen h-screen bg-black/70 backdrop-blur-xl z-40"
                                    style={{ pointerEvents: 'auto' }}
                                    onClick={() => setExpanded(null)}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                />
                                <DriverCardExpanded
                                    key={d.id} 
                                    d={d}
                                    setExpanded={() => setExpanded(null)}
                                />
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    )
}

export default DriverSection
