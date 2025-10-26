import { memo } from 'react';
import type { Driver } from '@/types/marketTypes';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    ResponsiveContainer, 
    Cell, 
    LabelList,
    PieChart,
    Pie
} from 'recharts';

/**
 * Props for DriverStatsCharts component
 * Reuses types from Driver interface to avoid duplication
 */
interface DriverStatsChartsProps {
    season_results: NonNullable<Driver['season_results']>;
    fantasy_stats: NonNullable<Driver['fantasy_stats']>;
}

export const DriverStatsCharts = memo(({ season_results, fantasy_stats }: DriverStatsChartsProps) => {
    const achievementsData = [
        { name: 'VICTORIES', value: season_results.victories, color: '#ffd700' },
        { name: 'POLES', value: season_results.poles, color: '#c0c0c0' },
        { name: 'PODIUMS', value: season_results.podiums, color: '#cd7f32' }
    ];

    const avgFinishData = [
        { name: 'AVG FINISH', value: fantasy_stats.avg_finish, color: '#3b82f6' }
    ];

    const overtakeData = [
        { 
            name: '', 
            value: fantasy_stats.overtake_efficiency,
            color: fantasy_stats.overtake_efficiency >= 0.5 ? '#22c55e' : 
                   fantasy_stats.overtake_efficiency >= 0 ? '#f59e0b' : '#ef4444'
        }
    ];

    const availablePointsData = [
        { name: 'Achieved', value: fantasy_stats.available_points_percentatge, color: '#22c55e' },
        { name: 'Missed', value: 100 - fantasy_stats.available_points_percentatge, color: '#6b7280' }
    ];

    const poleWinData = [
        { name: 'Success', value: fantasy_stats.pole_win_conversion, color: '#ffd700' },
        { name: 'Miss', value: 100 - fantasy_stats.pole_win_conversion, color: '#6b7280' }
    ];

    return (
        <div className="flex gap-10 p-5">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-transparent backdrop-blur-lg border border-white/20 rounded-2xl p-4">
                    <h4 className="text-[10px] font-medium text-white/80 uppercase tracking-wide text-center mb-4">
                        Season Achievements
                    </h4>
                    <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={achievementsData} margin={{ top: 5, right: 5, left: 5, bottom: 25 }}>
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{ fill: '#ffffff80', fontSize: 10 }}
                                    interval={0}
                                />
                                <YAxis hide />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    <LabelList 
                                        dataKey="value" 
                                        position="center" 
                                        fill="#ffffff" 
                                        fontSize={12} 
                                        fontWeight="bold"
                                    />
                                    {achievementsData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-transparent backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                    <h4 className="text-[10px] font-medium text-white/80 uppercase tracking-wide text-center mb-4">
                        Average Finish
                    </h4>
                    <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={avgFinishData} margin={{ top: 5, right: 5, left: 5, bottom: 10 }}>
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{ fill: '#ffffff80', fontSize: 10 }}
                                />
                                <YAxis hide domain={[0, 20]} />
                                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                    <LabelList 
                                        dataKey="value" 
                                        position="center" 
                                        fill="#ffffff" 
                                        fontSize={14} 
                                        fontWeight="bold"
                                        formatter={(value: any) => typeof value === 'number' ? value.toFixed(1) : value}
                                    />
                                    {avgFinishData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-transparent backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                    <h4 className="text-[10px] font-medium text-white/80 uppercase tracking-wide text-center mb-4">
                        Overtake Efficiency
                    </h4>
                    <div className="h-60">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={overtakeData} margin={{ top: 5, right: 5, left: 5, bottom: 20 }}>
                                <XAxis 
                                    dataKey="name" 
                                    axisLine={false} 
                                    tickLine={false}
                                    tick={{ fill: '#ffffff80', fontSize: 10 }}
                                />
                                <YAxis hide domain={[-1, 1]} />
                                <Bar dataKey="value" radius={[4, 4, 4, 4]}>
                                    <LabelList 
                                        dataKey="value" 
                                        position="center" 
                                        fill="#ffffff" 
                                        fontSize={20} 
                                        fontWeight="bold"
                                        formatter={(value: any) => typeof value === 'number' ? value.toFixed(2) : value}
                                    />
                                    {overtakeData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="text-xs text-white/60 text-center mt-2">
                        <span className="text-green-400">≥0.5 Excellent</span> • 
                        <span className="text-yellow-400 mx-1">0-0.5 Good</span> • 
                        <span className="text-red-400">&lt;0 Poor</span>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-transparent backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                    <h4 className="text-[10px] font-medium text-white/80 uppercase tracking-wide text-center mb-4">
                        Available Points %
                    </h4>
                    <div className="h-40 flex items-center justify-center">
                        <div className="relative">
                            <ResponsiveContainer width={140} height={140}>
                                <PieChart>
                                    <Pie
                                        data={availablePointsData}
                                        cx={70}
                                        cy={70}
                                        innerRadius={35}
                                        outerRadius={60}
                                        dataKey="value"
                                        strokeWidth={0}
                                        startAngle={90}
                                        endAngle={450}
                                    >
                                        {availablePointsData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <span className="text-white font-bold text-lg">
                                        {fantasy_stats.available_points_percentatge}%
                                    </span>
                                    <div className="text-white/60 text-xs">achieved</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="bg-transparent backdrop-blur-sm border border-white/20 rounded-2xl p-4">
                    <h4 className="text-[10px] font-medium text-white/80 uppercase tracking-wide text-center mb-4">
                        Pole to Win Ratio
                    </h4>
                    <div className="h-40 flex items-center justify-center">
                        <div className="relative">
                            <ResponsiveContainer width={140} height={140}>
                                <PieChart>
                                    <Pie
                                        data={poleWinData}
                                        cx={70}
                                        cy={70}
                                        innerRadius={35}
                                        outerRadius={60}
                                        dataKey="value"
                                        strokeWidth={0}
                                        startAngle={90}
                                        endAngle={450}
                                    >
                                        {poleWinData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <span className="text-white font-bold text-lg">
                                        {fantasy_stats.pole_win_conversion}%
                                    </span>
                                    <div className="text-white/60 text-xs">success</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

DriverStatsCharts.displayName = 'DriverStatsCharts';
