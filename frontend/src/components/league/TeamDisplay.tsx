interface Driver {
    id: number;
    full_name: string;
    driver_color: string;
    headshot_url: string;
    team_name?: string;
}

interface Team {
    id: number;
    team_name: string;
    team_color: string;
    season_results?: {
        points: number;
    };
}

interface TeamDisplayProps {
    drivers: (Driver | undefined)[];
    constructor: Team | null;
}

export const TeamDisplay = ({ drivers, constructor }: TeamDisplayProps) => {
    const validDrivers = drivers.filter(Boolean) as Driver[];

    return (
        <div className="grid md:grid-cols-2 gap-6">
            {/* Drivers Section */}
            <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-3">
                    Drivers
                </h3>
                <div className="space-y-2">
                    {validDrivers.map((driver) => (
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
                        </div>
                    ))}
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
