import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { f1DataService } from '@/services';
import type { Driver } from '@/types/driverTypes';
import type { Team } from '@/types/teamsTypes';
import { motion, AnimatePresence } from 'framer-motion';
import DriverCardExpanded from '@/components/picks/DriverCardExpanded';
import { useLeagueDetail } from '@/hooks/useLeagueDetail';
import { useUserTeam, useCreateOrUpdateTeam } from '@/hooks/useUserTeam';

const TeamBuilder = () => {
    const { leagueId } = useParams<{ leagueId: string }>();
    const navigate = useNavigate();
    
    const { data: league, isLoading: leagueLoading, error: leagueError } = useLeagueDetail(leagueId!);
    
    const { data: existingTeam, isLoading: teamLoading } = useUserTeam(parseInt(leagueId!));
    const createOrUpdateTeamMutation = useCreateOrUpdateTeam();
    
    const [selectedDrivers, setSelectedDrivers] = useState<Driver[]>([]);
    const [selectedConstructor, setSelectedConstructor] = useState<Team | null>(null);
    const [expandedDriver, setExpandedDriver] = useState<Driver | null>(null);
    const [searchFilter, setSearchFilter] = useState<string>('');
    const [teamName, setTeamName] = useState<string>('');
    
    const { data: drivers, isLoading: driversLoading } = useQuery({
        queryKey: ['drivers'],
        queryFn: f1DataService.getAllDrivers,
    });
    
    const { data: teams, isLoading: constructorsLoading } = useQuery({
        queryKey: ['teams'],
        queryFn: f1DataService.getAllTeams,
    });

    useEffect(() => {
        if (existingTeam && drivers && teams) {
            setTeamName(existingTeam.team_name);
            
            const driver1 = drivers.find(d => d.id === existingTeam.driver_1_id);
            const driver2 = drivers.find(d => d.id === existingTeam.driver_2_id);
            const driver3 = drivers.find(d => d.id === existingTeam.driver_3_id);
            
            if (driver1 && driver2 && driver3) {
                setSelectedDrivers([driver1, driver2, driver3]);
            }
            
            const team = teams.find(t => t.id === existingTeam.constructor_id);
            if (team) {
                setSelectedConstructor(team);
            }
        }
    }, [existingTeam, drivers, teams]);

    const handleDriverSelect = (driver: Driver) => {
        if (selectedDrivers.find(d => d.id === driver.id)) {
            setSelectedDrivers(prev => prev.filter(d => d.id !== driver.id));
        } else if (selectedDrivers.length < 3) {
            setSelectedDrivers(prev => [...prev, driver]);
        }
    };

    const handleConstructorSelect = (team: Team) => {
        if (selectedConstructor?.id === team.id) {
            setSelectedConstructor(null);
        } else {
            setSelectedConstructor(team);
        }
    };

    const handleSaveTeam = async () => {
        if (!isTeamComplete) return;
        
        try {
            await createOrUpdateTeamMutation.mutateAsync({
                leagueId: parseInt(leagueId!),
                teamData: {
                    team_name: teamName,
                    driver_1_id: selectedDrivers[0].id,
                    driver_2_id: selectedDrivers[1].id,
                    driver_3_id: selectedDrivers[2].id,
                    constructor_id: selectedConstructor!.id
                }
            });
            
            navigate(`/leagues/${leagueId}`, { 
                state: { message: 'Team saved successfully!' }
            });
        } catch (error) {
            console.error('Error saving team:', error);
            alert('Failed to save team. Please try again.');
        }
    };

    const isTeamComplete = selectedDrivers.length === 3 && selectedConstructor !== null && teamName.length >= 4;

    const getButtonText = () => {
        const driversNeeded = 3 - selectedDrivers.length;
        const constructorNeeded = selectedConstructor ? 0 : 1;
        
        if (isTeamComplete) {
            return 'Save Team';
        }
        
        if (driversNeeded > 0 && constructorNeeded > 0) {
            return `Select ${driversNeeded} more driver(s) and ${constructorNeeded} constructor`;
        }
        
        if (driversNeeded > 0) {
            return `Select ${driversNeeded} more driver(s)`;
        }
        
        if (constructorNeeded > 0) {
            return 'Select a constructor';
        }

        if (teamName.trim().length === 0) {
            return 'Enter a team name to continue';
        }
        
        if (teamName.trim().length < 4) {
            return 'Team name must be at least 4 characters';
        }
        
        return 'Complete your team selection';
    };

    const filteredDrivers = drivers?.filter(driver => {
        if (!searchFilter.trim()) return true;
        const searchTerm = searchFilter.toLowerCase();
        return (
            driver.full_name.toLowerCase().includes(searchTerm) ||
            driver.team_name.toLowerCase().includes(searchTerm)
        );
    });

    const filteredConstructors = teams?.filter(team => {
        if (!searchFilter.trim()) return true;
        const searchTerm = searchFilter.toLowerCase();
        return team.team_name.toLowerCase().includes(searchTerm);
    });

    if (leagueLoading || driversLoading || constructorsLoading || teamLoading) {
        return (
            <div className="p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
                        <p className="text-gray-400 text-lg">
                            {leagueLoading ? 'Verifying league access...' : 'Loading drivers and teams...'}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (leagueError || !league) {
        return (
            <div className="p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center py-12">
                        <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h2 className="text-red-400 text-2xl font-bold mb-2">Access Denied</h2>
                        <p className="text-gray-400 text-lg mb-4">You are not a member of this league</p>
                        <button
                            onClick={() => navigate('/leagues')}
                            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                        >
                            Back to Leagues
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (driversLoading || constructorsLoading) {
        return (
            <div className="p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-red-500 mx-auto mb-4"></div>
                        <p className="text-gray-400 text-lg">Loading drivers and constructors...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="max-w-6xl mx-auto">
                <div className="mb-8">
                    <button
                        onClick={() => navigate(`/leagues/${leagueId}`)}
                        className="flex items-center text-gray-400 hover:text-white mb-4 transition-colors"
                    >
                        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to {league.name}
                    </button>
                    
                    <h1 className="text-4xl font-bold text-white mb-4">
                        Build Your Fantasy Team
                    </h1>
                    <p className="text-gray-300 text-lg">
                        Select 3 drivers and 1 team for your fantasy lineup in <span className="text-blue-400 font-medium">{league.name}</span>
                    </p>
                </div>
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 backdrop-blur-sm rounded-2xl p-6 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-4">Your Team</h2>
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Team Name
                        </label>
                        <input
                            type="text"
                            value={teamName}
                            onChange={(e) => setTeamName(e.target.value)}
                            placeholder="Enter your team name..."
                            className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                        />
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <h3 className="text-lg font-semibold text-gray-300 mb-3">
                                Drivers ({selectedDrivers.length}/3)
                            </h3>
                            <div className="space-y-2">
                                {selectedDrivers.map((driver) => (
                                    <div 
                                        key={driver.id}
                                        className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg group"
                                    >
                                        <img 
                                            src={driver.headshot_url} 
                                            alt={driver.full_name}
                                            className="w-12 h-12 rounded-full object-cover object-top"
                                        />
                                        <div className="flex-1">
                                            <p className="text-white font-medium">{driver.full_name}</p>
                                            <p className="text-gray-400 text-sm">{driver.team_name}</p>
                                        </div>
                                        <div className="text-right mr-3">
                                            <p className="text-green-300 text-sm font-medium">
                                                ${(driver.fantasy_stats.price / 1_000_000).toFixed(1)}M
                                            </p>
                                        </div>
                                        <button
                                            onClick={() => handleDriverSelect(driver)}
                                            className="p-1 rounded-md bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 hover:border-red-500/60 transition-all duration-150 opacity-0 group-hover:opacity-100"
                                            title="Remove driver"
                                        >
                                            <svg 
                                                className="w-4 h-4 text-red-400 hover:text-red-300" 
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
                                ))}
                                {Array.from({ length: 3 - selectedDrivers.length }).map((_, index) => (
                                    <div 
                                        key={`empty-${index}`}
                                        className="flex items-center justify-center p-3 border-2 border-dashed border-gray-600 rounded-lg"
                                    >
                                        <p className="text-gray-500">Select a driver</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-300 mb-3">
                                Team ({selectedConstructor ? 1 : 0}/1)
                            </h3>
                            {selectedConstructor ? (
                                <div className="p-4 bg-gray-700/30 rounded-lg group">
                                    <div className="flex items-center justify-between mb-2">
                                        <div 
                                            className="w-8 h-8 rounded-full"
                                            style={{ backgroundColor: selectedConstructor.team_color }}
                                        ></div>
                                        <button
                                            onClick={() => handleConstructorSelect(selectedConstructor)}
                                            className="p-1 rounded-md bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 hover:border-red-500/60 transition-all duration-150 opacity-0 group-hover:opacity-100"
                                            title="Remove team"
                                        >
                                            <svg 
                                                className="w-4 h-4 text-red-400 hover:text-red-300" 
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
                                    <p className="text-white font-medium">{selectedConstructor.team_name}</p>
                                    <p className="text-gray-400 text-sm">{selectedConstructor.points} points</p>
                                </div>
                            ) : (
                                <div className="flex items-center justify-center p-4 border-2 border-dashed border-gray-600 rounded-lg">
                                    <p className="text-gray-500">Select a team</p>
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="mt-6 p-4 bg-gradient-to-r from-green-600/10 to-blue-600/10 border border-green-500/20 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="text-gray-300 font-medium">Total Budget:</span>
                            <span className="text-green-300 font-bold text-lg">
                                ${(selectedDrivers.reduce((acc, driver) => acc + driver.fantasy_stats.price, 0) / 1_000_000).toFixed(1)}M
                                <span className="text-gray-400 text-sm ml-1">/ 100M</span>
                            </span>
                        </div>
                        <div className="mt-2 w-full bg-gray-700 rounded-full h-2">
                            <div 
                                className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                                style={{ 
                                    width: `${Math.min((selectedDrivers.reduce((acc, driver) => acc + driver.fantasy_stats.price, 0) / 1_000_000) / 100 * 100, 100)}%` 
                                }}
                            ></div>
                        </div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-600/30">
                        <button
                            onClick={handleSaveTeam}
                            disabled={!isTeamComplete}
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-all duration-200"
                        >
                            {getButtonText()}
                        </button>
                    </div>
                </div>
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 backdrop-blur-sm rounded-2xl p-6 mb-8">
                    <div className="max-w-md mx-auto">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            Search Drivers & Constructors
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchFilter}
                                onChange={(e) => setSearchFilter(e.target.value)}
                                placeholder="Search by driver name or team..."
                                className="w-full px-4 py-3 pl-10 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
                            />
                            <svg 
                                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400"
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" 
                                />
                            </svg>
                            {searchFilter && (
                                <button
                                    onClick={() => setSearchFilter('')}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-600/50 transition-colors"
                                >
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            )}
                        </div>
                        {searchFilter && (
                            <p className="text-sm text-gray-400 mt-2">
                                Showing results for "<span className="text-white">{searchFilter}</span>"
                            </p>
                        )}
                    </div>
                </div>
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 backdrop-blur-sm rounded-2xl p-6 mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Select Drivers</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredDrivers?.map((driver) => {
                            const isSelected = selectedDrivers.find(d => d.id === driver.id);
                            const canSelect = selectedDrivers.length < 3 || isSelected;
                            
                            return (
                                <motion.div
                                    key={driver.id}
                                    onClick={() => canSelect && handleDriverSelect(driver)}
                                    className={`p-4 rounded-lg border backdrop-blur-[10px] ${
                                        canSelect 
                                            ? 'cursor-pointer hover:backdrop-blur-[2px]'
                                            : 'opacity-50 cursor-not-allowed'
                                    }`}
                                    style={{
                                        borderColor: isSelected 
                                            ? `${driver.driver_color}`
                                            : canSelect 
                                                ? `${driver.driver_color}60` 
                                                : "rgb(60,70,80,1)",
                                        backgroundColor: isSelected 
                                            ? `${driver.driver_color}90`
                                            : canSelect 
                                                ? `${driver.driver_color}20` 
                                                : "rgb(60,70,80,1)"
                                    }}
                                    whileHover={{
                                        borderColor: canSelect ? `${driver.driver_color}` : "rgb(60,70,80,1)",
                                        backgroundColor: isSelected
                                            ? `${driver.driver_color}90`
                                            : canSelect
                                                ? `${driver.driver_color}90`
                                                : "rgb(60,70,80,1)",
                                        scale: canSelect ? 1.02 : 1
                                    }}
                                    transition={{
                                        duration: 0.15,
                                        ease: "easeOut"
                                    }}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <img 
                                            src={driver.headshot_url} 
                                            alt={driver.full_name}
                                            className="w-12 h-12 rounded-full object-cover object-top"
                                        />
                                        <div className="text-[70%] flex-1">
                                            <p className="text-white font-medium">{driver.full_name}</p>
                                            <p className="text-gray-400 text-sm">{driver.team_name}</p>
                                        </div>
                                        <div 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setExpandedDriver(driver);
                                            }}
                                            className="p-2 rounded-lg bg-gray-700/60 hover:bg-gray-500/80 border border-gray-600/40 hover:border-gray-400/60 transition-all duration-150 cursor-pointer group shadow-lg hover:shadow-xl"
                                        >
                                            <svg 
                                                className="w-5 h-5 text-gray-200 group-hover:text-white transition-colors" 
                                                fill="currentColor" 
                                                viewBox="0 0 20 20"
                                            >
                                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                            </svg>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div className="text-center p-2 bg-gray-600/30 rounded">
                                            <p className="text-gray-400">Points</p>
                                            <p className="text-white font-semibold">{driver.season_results.points}</p>
                                        </div>
                                        <div className="text-center p-2 bg-gray-600/30 rounded">
                                            <p className="text-gray-400">Avg Finish</p>
                                            <p className="text-white font-semibold">{driver.fantasy_stats.avg_finish.toFixed(1)}</p>
                                        </div>
                                        <div className="text-center p-2 bg-green-500/70 rounded border border-green-200/50">
                                            <p className="text-purple-200">Price</p>
                                            <p className="text-purple-50 font-semibold">${(driver.fantasy_stats.price / 1_000_000).toFixed(1)}M</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
                <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 backdrop-blur-sm rounded-2xl p-6">
                    <h2 className="text-2xl font-bold text-white mb-6">Select Team</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredConstructors
                            ?.map((constructor) => {
                                const teamDrivers = drivers?.filter(d => d.team_name === constructor.team_name) || [];
                                const points = teamDrivers.reduce((acc, driver) => acc + (driver.season_results?.points || 0), 0);
                                return { ...constructor, calculatedPoints: points };
                            })
                            ?.sort((a, b) => b.calculatedPoints - a.calculatedPoints)
                            ?.map((constructor) => {
                                const isSelected = selectedConstructor?.id === constructor.id;
                                
                                return (
                                <motion.div
                                    key={constructor.id}
                                    onClick={() => handleConstructorSelect(constructor)}
                                    className={`p-4 rounded-lg border cursor-pointer ${
                                        isSelected 
                                            ? 'border-green-500 bg-green-600/20' 
                                            : 'border-gray-600 bg-gray-700/30'
                                    }`}
                                    style={{
                                        borderColor: isSelected 
                                            ? `${constructor.team_color}`
                                            : `${constructor.team_color}30`,
                                        backgroundColor: isSelected 
                                            ? `${constructor.team_color}60`
                                            : `${constructor.team_color}10`
                                    }}
                                    whileHover={{
                                        borderColor: `${constructor.team_color}`,
                                        backgroundColor: isSelected
                                            ? `${constructor.team_color}70`
                                            : `${constructor.team_color}40`,
                                        scale: 1.02
                                    }}
                                    transition={{
                                        duration: 0.15,
                                        ease: "easeOut"
                                    }}
                                >
                                    <div className="flex items-center gap-3 mb-3">
                                        <img 
                                            src={`/teams/${constructor.team_name.toLowerCase().replace(/\s/g, "")}.svg`}
                                            alt={`${constructor.team_name}`}
                                            className="max-w-[10%]"
                                        />
                                        <div>
                                            <p className="text-white font-medium">{constructor.team_name}</p>
                                            <p className="text-gray-400 text-sm">{constructor.calculatedPoints} points</p>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </div>
            <AnimatePresence>
                {expandedDriver && (
                    <div>
                        <motion.div
                            className="fixed inset-0 backdrop-blur-md bg-black/50 z-40"
                            onClick={() => setExpandedDriver(null)}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        />
                        <DriverCardExpanded
                            key={expandedDriver.id}
                            d={expandedDriver}
                            setExpanded={() => setExpandedDriver(null)}
                        />
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TeamBuilder;