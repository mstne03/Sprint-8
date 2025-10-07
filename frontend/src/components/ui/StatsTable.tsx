import { memo, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, LabelList } from 'recharts';
import { compareStatsTableProps } from '@/utils';

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

const StatsTable = memo(({ season_results, fantasy_stats }: StatsTableProps) => {
    const quantitativeData = useMemo(() => [
        { name: 'VICTORIES', value: season_results.victories, color: '#ffd700' },
        { name: 'POLES', value: season_results.poles, color: '#c0c0c0' },
        { name: 'PODIUMS', value: season_results.podiums, color: '#cd7f32' }
    ], [season_results.victories, season_results.poles, season_results.podiums]);

    const averageData = useMemo(() => [
        { name: 'AVG FINISH', value: fantasy_stats.avg_finish, color: '#3b82f6' },
        { name: 'AVG GRID POSITION', value: fantasy_stats.avg_grid_position, color: '#10b981' }
    ], [fantasy_stats.avg_finish, fantasy_stats.avg_grid_position]);

    return (
        <div className="
                rounded-3xl pe-15 bg-transparent backdrop-blur-[5px] border-0 border-white/10
                shadow-lg h-full max-h-[400px] overflow-hidden
        ">
            <div className="
                overflow-y-auto h-full p-4
                scrollbar-thin scrollbar-track-white/10 scrollbar-thumb-white/30
                max-w-2xl mx-auto
            ">
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                    <h4 className="text-xs font-medium text-white/80 uppercase tracking-wide text-center">
                        Season Achievements
                    </h4>
                    <div className="h-40">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={quantitativeData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
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
                <div className="space-y-3">
                <h4 className="text-xs font-medium text-white/80 uppercase tracking-wide text-center">
                    Average Performance
                </h4>
                <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={averageData} margin={{ top: 5, right: 5, left: 5, bottom: 0 }}>
                            <XAxis 
                                dataKey="name" 
                                axisLine={false} 
                                tickLine={false}
                                tick={{ fill: '#ffffff80', fontSize: 9 }}
                                interval={0}
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
            </div>
        </div>
    )
}, compareStatsTableProps);

export default StatsTable;
