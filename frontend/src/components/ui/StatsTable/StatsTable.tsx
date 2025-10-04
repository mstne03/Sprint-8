import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie, LabelList } from 'recharts';

interface StatsTableProps {
    season_results: {
        victories: number;
        poles: number;
        podiums: number;
    };
    fantasy_stats: {
        avg_finish: number;
        avg_grid_position: number;
        pole_win_conversion: number;
    };
}

const StatsTable = ({ season_results, fantasy_stats }: StatsTableProps) => {
    // Datos cuantitativos (valores absolutos)
    const quantitativeData = [
        { name: 'VIC', value: season_results.victories, color: '#ffd700' },
        { name: 'POLES', value: season_results.poles, color: '#c0c0c0' },
        { name: 'POD', value: season_results.podiums, color: '#cd7f32' }
    ];

    // Datos de promedio (coeficientes - valores más bajos son mejores)
    const averageData = [
        { name: 'AVG FINISH', value: fantasy_stats.avg_finish, color: '#3b82f6' },
        { name: 'AVG GRID', value: fantasy_stats.avg_grid_position, color: '#10b981' }
    ];

    // Datos de conversión (porcentaje)
    const conversionData = [
        { name: 'Success', value: fantasy_stats.pole_win_conversion, color: '#22c55e' },
        { name: 'Miss', value: 100 - fantasy_stats.pole_win_conversion, color: '#ef4444' }
    ];

    return (
        <div className="
                rounded-2xl bg-black/30 backdrop-blur-sm border border-white/20 
                shadow-lg h-full max-h-[400px] overflow-hidden
        ">
            <div className="
                overflow-y-auto h-full p-4
                scrollbar-thin scrollbar-track-white/10 scrollbar-thumb-white/30
                max-w-2xl mx-auto
            ">
            {/* Gráficos lado a lado */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Gráfico de métricas cuantitativas */}
                <div className="space-y-3">
                    <h4 className="text-xs font-medium text-white/80 uppercase tracking-wide text-center">
                        Season Achievements
                    </h4>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={quantitativeData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{ fill: '#ffffff80', fontSize: 9 }}
                                />
                                <YAxis hide />
                                <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                                    <LabelList 
                                        dataKey="value" 
                                        position="center" 
                                        fill="#ffffff" 
                                        fontSize={12} 
                                        fontWeight="bold"
                                    />
                                    {quantitativeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Gráfico de promedios (invertido - más bajo es mejor) */}
                <div className="space-y-3">
                <h4 className="text-xs font-medium text-white/80 uppercase tracking-wide text-center">
                    Average Performance
                </h4>
                <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={averageData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false}
                                tick={{ fill: '#ffffff80', fontSize: 8 }}
                            />
                            <YAxis hide domain={[0, 20]} />
                            <Bar dataKey="value" radius={[2, 2, 0, 0]}>
                                <LabelList 
                                    dataKey="value" 
                                    position="center" 
                                    fill="#ffffff" 
                                    fontSize={12} 
                                    fontWeight="bold"
                                    formatter={(value: number) => value.toFixed(1)}
                                />
                                {averageData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                </div>
            </div>

            {/* Gráfico de conversión (pie chart) centrado */}
            {/*<div className="space-y-3 flex flex-col items-center">
                <h4 className="text-xs font-medium text-white/80 uppercase tracking-wide text-center">
                    Pole to Win Conversion
                </h4>
                <div className="h-32 flex items-center justify-center">
                    <div className="relative">
                        <ResponsiveContainer width={120} height={120}>
                            <PieChart>
                                <Pie
                                    data={conversionData}
                                    cx={60}
                                    cy={60}
                                    innerRadius={30}
                                    outerRadius={50}
                                    dataKey="value"
                                    strokeWidth={0}
                                >
                                    {conversionData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">
                                {fantasy_stats.pole_win_conversion}%
                            </span>
                        </div>
                    </div>
                </div>
            </div>*/}
            </div>
        </div>
    )
}

export default StatsTable
