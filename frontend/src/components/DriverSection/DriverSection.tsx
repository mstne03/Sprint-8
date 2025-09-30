import { useDrivers } from '@/features/drivers/hooks';
import DriverCard from '@/components/DriverCard/DriverCard'
import { useState } from 'react';
import DriverCardExpanded from '../DriverCardExpanded/DriverCardExpanded';
import { AnimatePresence, motion } from 'framer-motion';

const LoadingSpinner = () => (
    <div className="flex flex-col items-center justify-center w-full py-16">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-red-600 border-solid"></div>
        <p className="mt-4 text-white text-lg font-medium">Loading drivers...</p>
    </div>
);

const ErrorMessage = ({ error }: { error: Error }) => (
    <div className="flex flex-col items-center justify-center w-full py-16">
        <h3 className="text-white text-xl font-bold mb-2">Error loading drivers</h3>
        <p className="text-red-500 text-center max-w-md">
            {error.message || "Something went wrong while fetching driver data."}
        </p>
    </div>
);

const DriverSection = () => {
    const { data: drivers, isLoading, isError, error } = useDrivers();
    const [expanded, setExpanded] = useState<string | null>(null);

    if (isLoading) {
        return (
            <section>
                <LoadingSpinner />
            </section>
        );
    }

    if (isError) {
        return (
            <section>
                <ErrorMessage error={error as Error} />
            </section>
        );
    }

    if (!drivers || drivers.length === 0) {
        return (
            <section>
                <div className="flex flex-col items-center justify-center w-full py-16">
                    <h3 className="text-white text-xl font-bold mb-2">No drivers found</h3>
                    <p className="text-gray-300 text-center">
                        No driver data is currently available.
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section>
            <div className="text-white mx-15 grid md:grid-cols-1 grid-cols-1 gap-10 overflow-hidden">
                {drivers.map((d) => (
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
                                        key={d.full_name}
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
