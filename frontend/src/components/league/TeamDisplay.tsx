import type { TeamDisplayProps, LineupDriver } from '@/types/leagueTypes';

export const TeamDisplay = ({ drivers, constructor }: TeamDisplayProps) => {
    const validDrivers = drivers.filter(Boolean) as LineupDriver[];
    const mainDrivers = validDrivers.slice(0, 3);
    const reserveDriver = validDrivers[3];

    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Drivers Section */}
            <div>
                {/* Main Drivers */}
                <div className="mb-4">
                    <h3 className="text-lg font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        Main Drivers
                        <span className="text-xs text-gray-500 bg-gray-700/50 px-2 py-0.5 rounded-full">
                            {mainDrivers.length}/3
                        </span>
                    </h3>
                    <div className="space-y-2">
                        {mainDrivers.map((driver) => (
                            <div 
                                key={driver.id}
                                className="flex items-center border gap-3 p-3 rounded-lg"
                                style={{
                                    backgroundColor: `${driver.driver_color}70`,
                                    borderColor: `${driver.driver_color}90`
                                }}
                            >
                                <img 
                                    src={driver.headshot_url} 
                                    alt={driver.full_name}
                                    className="w-12 h-12 rounded-full object-cover object-top"
                                />
                                <div className="flex-1">
                                    <p className="text-white font-medium">{driver.full_name}</p>
                                    <p className="text-gray-100 text-sm">{driver.team_name}</p>
                                </div>
                                {driver.fantasy_stats?.price && (
                                    <div className="text-right">
                                        <p className="text-white text-sm font-medium">
                                            ${(driver.fantasy_stats.price / 1_000_000).toFixed(1)}M
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))}
                        {/* Empty slots for main drivers */}
                        {mainDrivers.length < 3 && Array.from({ length: 3 - mainDrivers.length }).map((_, i) => (
                            <div 
                                key={`empty-main-${i}`}
                                className="flex items-center justify-center border-2 border-dashed border-gray-600/50 rounded-lg p-3 h-[72px]"
                            >
                                <p className="text-gray-500 text-sm">Empty slot</p>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Reserve Driver */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-300 mb-3 flex items-center gap-2">
                        Reserve Driver
                        <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-0.5 rounded-full border border-purple-500/30">
                            Optional
                        </span>
                    </h3>
                    {reserveDriver ? (
                        <div 
                            className="flex items-center border gap-3 p-3 rounded-lg relative overflow-hidden"
                            style={{
                                backgroundColor: `${reserveDriver.driver_color}70`,
                                borderColor: `${reserveDriver.driver_color}90`
                            }}
                        >
                            {/* Reserve Badge */}
                            <div className="absolute top-1 right-1 bg-purple-600/90 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-purple-400/50">
                                RESERVE
                            </div>
                            <img 
                                src={reserveDriver.headshot_url} 
                                alt={reserveDriver.full_name}
                                className="w-12 h-12 rounded-full object-cover object-top"
                            />
                            <div className="flex-1">
                                <p className="text-white font-medium">{reserveDriver.full_name}</p>
                                <p className="text-gray-100 text-sm">{reserveDriver.team_name}</p>
                            </div>
                            {reserveDriver.fantasy_stats?.price && (
                                <div className="text-right">
                                    <p className="text-white text-sm font-medium">
                                        ${(reserveDriver.fantasy_stats.price / 1_000_000).toFixed(1)}M
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center border-2 border-dashed border-purple-600/30 bg-purple-900/10 rounded-lg p-4 h-[72px]">
                            <p className="text-purple-400/70 text-sm">No reserve driver</p>
                            <p className="text-purple-500/50 text-xs mt-1">4th driver slot available</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Constructor Section */}
            <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-3">
                    Constructor
                </h3>
                {constructor ? (
                    <div 
                        className="p-4 border rounded-lg"
                        style={{
                            backgroundColor: `${constructor.team_color}70`,
                            borderColor: `${constructor.team_color}90`
                        }}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <img 
                                src={`/teams/${constructor.team_name.toLowerCase().replace(/\s/g, "")}.svg`}
                                alt={`${constructor.team_name}`}
                                className="max-w-[10%]"
                            />
                        </div>
                        <p className="text-white font-medium">{constructor.team_name}</p>
                        <p className="text-gray-100 text-sm">
                            {constructor.season_results?.points || 0} points
                        </p>
                    </div>
                ) : (
                    <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg">
                        <p className="text-gray-500">Select a team</p>
                    </div>
                )}
            </div>
        </div>
    );
};
