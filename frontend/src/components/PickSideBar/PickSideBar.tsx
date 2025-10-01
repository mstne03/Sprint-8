import { usePicks } from "@/context/PicksContext";
import CustomButton from "@/components/ui/CustomButton/CustomButton";

const PickSideBar = () => {
    const { selectedDrivers, selectedConstructor, removeDriver, canContinue } = usePicks();

    return (
        <div className="w-full backdrop-blur-3xl bg-white/10 border-3 border-white rounded-xl p-8 shadow-xl shadow-black/25">
            <div className="flex flex-col gap-2">
                <h2 className="text-2xl font-bold text-center text-white mb-4">
                    SELECTED DRIVERS
                </h2>
                
                <div className="space-y-3">
                    {selectedDrivers.length === 0 ? (
                        <p className="text-center text-gray-400 italic py-8">
                            No drivers selected yet
                        </p>
                    ) : (
                        selectedDrivers.map((driver, index) => (
                            <div 
                                key={driver.full_name}
                                className="flex items-center justify-between bg-white/5 border border-white/20 rounded-lg p-4 backdrop-blur-sm"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-amber-400 font-bold text-sm">
                                        {index < 2 ? `DRIVER ${index + 1}` : 'RESERVE'}
                                    </span>
                                    <span className="text-white font-medium">
                                        {driver.full_name}
                                    </span>
                                </div>
                                <button
                                    onClick={() => removeDriver(driver.full_name)}
                                    className="text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded-full transition-all duration-200"
                                    title="Remove driver"
                                >
                                    <svg 
                                        className="w-5 h-5" 
                                        fill="none" 
                                        stroke="currentColor" 
                                        viewBox="0 0 24 24"
                                    >
                                        <path 
                                            strokeLinecap="round" 
                                            strokeLinejoin="round" 
                                            strokeWidth={2} 
                                            d="M6 18L18 6M6 6l12 12" 
                                        />
                                    </svg>
                                </button>
                            </div>
                        ))
                    )}
                </div>

                <div className="flex justify-center gap-2 mt-4">
                    {[0, 1, 2].map((index) => (
                        <div
                            key={index}
                            className={`w-3 h-3 rounded-full transition-all duration-300 ${
                                index < selectedDrivers.length 
                                    ? 'bg-amber-600' 
                                    : 'bg-white/20'
                            }`}
                        />
                    ))}
                </div>

                <div className="my-1 flex items-center justify-center">
                    {canContinue ? (
                        <CustomButton
                            onClick={() => {
                                console.log('Continue to next step');
                            }}
                        >
                            CONTINUE
                        </CustomButton>
                    ) : (
                        <button
                            disabled={true}
                            className="mt-6 px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 bg-gray-600 text-gray-400 cursor-not-allowed opacity-50"
                        >
                            {!selectedConstructor 
                                ? 'SELECT A CONSTRUCTOR TO CONTINUE' 
                                : selectedDrivers.length < 3 
                                    ? `SELECT ${3 - selectedDrivers.length} MORE DRIVER${3 - selectedDrivers.length > 1 ? 'S' : ''}`
                                    : 'CONTINUE'
                            }
                        </button>
                    )}
                </div>

                <div className="text-center text-sm text-gray-400 mt-2">
                    {selectedDrivers.length}/3 drivers selected
                    {selectedConstructor && (
                        <span className="ml-2 text-amber-400">
                            | Constructor: {selectedConstructor}
                        </span>
                    )}
                </div>
            </div>
        </div>
    )
}

export default PickSideBar