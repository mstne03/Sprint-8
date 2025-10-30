import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'

vi.mock('@/core/services/f1DataService', () => ({
    f1DataService: {
        getAllDrivers: vi.fn(),
        getAllTeams: vi.fn(),
    }
}))

import { f1DataService } from '@/core/services/f1DataService'
import type { Driver } from '@/features/Market/types/marketTypes'
import { useDrivers, useTeams } from '@/core/hooks/db'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import DataServiceProvider from '@/core/contexts/ServiceProvider'
import type { Team } from '@/core/types'

describe('f1DataService', () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                retry: false,
            }
        }
    })
    
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>
            <DataServiceProvider>
                {children}
            </DataServiceProvider>
        </QueryClientProvider>
    )

    beforeEach(() => {
        vi.clearAllMocks()
        queryClient.clear()
    })

    describe('drivers', () => {
        const mockDriversFromAPI: Driver[] = [
            {
                id: 1,
                driver_number: 1,
                full_name: 'Max Verstappen',
                acronym: 'VER',
                driver_color: '#0600EF',
                country_code: 'NED',
                headshot_url: 'https://example.com/max.jpg',
                team_name: 'Red Bull Racing',
                season_results: {
                    points: 575,
                    poles: 8,
                    podiums: 19,
                    fastest_laps: 7,
                    victories: 19,
                    sprint_podiums: 3,
                    sprint_victories: 2,
                    sprint_poles: 4
                },
                fantasy_stats: {
                    price: 30000000,
                    avg_finish: 2.1,
                    avg_grid_position: 1.8,
                    pole_win_conversion: 0.85,
                    overtake_efficiency: 0.92,
                    available_points_percentatge: 0.98
                }
            },
            {
                id: 2,
                driver_number: 99,
                full_name: 'Invalid Driver',
                acronym: 'INV',
                driver_color: '#000000',
                country_code: 'XXX',
                headshot_url: 'None', // ← Este debe ser filtrado
                team_name: 'No Team',
                season_results: {
                    points: 0,
                    poles: 0,
                    podiums: 0,
                    fastest_laps: 0,
                    victories: 0,
                    sprint_podiums: 0,
                    sprint_victories: 0,
                    sprint_poles: 0
                },
                fantasy_stats: {
                    price: 5000000,
                    avg_finish: 15.0,
                    avg_grid_position: 18.0,
                    pole_win_conversion: 0.0,
                    overtake_efficiency: 0.3,
                    available_points_percentatge: 0.5
                }
            },
            {
                id: 44,
                driver_number: 44,
                full_name: 'Lewis Hamilton',
                acronym: 'HAM',
                driver_color: '#00D2BE',
                country_code: 'GBR',
                headshot_url: 'https://example.com/lewis.jpg',
                team_name: 'Mercedes',
                season_results: {
                    points: 234,
                    poles: 2,
                    podiums: 8,
                    fastest_laps: 3,
                    victories: 2,
                    sprint_podiums: 1,
                    sprint_victories: 0,
                    sprint_poles: 1
                },
                fantasy_stats: {
                    price: 25000000,
                    avg_finish: 4.5,
                    avg_grid_position: 5.2,
                    pole_win_conversion: 0.65,
                    overtake_efficiency: 0.88,
                    available_points_percentatge: 0.95
                }
            }
        ]

        it('should fetch drivers using api service', async () => {
            const filteredMockDrivers = mockDriversFromAPI.filter(d => d.headshot_url !== 'None')
            vi.mocked(f1DataService.getAllDrivers).mockResolvedValue(filteredMockDrivers)

            const { result } = renderHook(() => useDrivers(), { wrapper })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data).toEqual(filteredMockDrivers)
            expect(f1DataService.getAllDrivers).toHaveBeenCalledTimes(1)
        })

        it('should handle server errors', async () => {
            vi.mocked(f1DataService.getAllDrivers).mockRejectedValue(
                new Error('Internal Server Error')
            )

            const { result } = renderHook(() => useDrivers(), { wrapper })
            
            await waitFor(() => {
                expect(result.current.isError).toBe(true)
            })

            expect(result.current.error).toBeDefined()
        })
    })

    describe('teams', () => {
        const mockTeamsFromAPI: Team[] = [
            {
                id: 1,
                team_name: 'Red Bull Racing',
                team_color: '#0600EF',
                team_url: 'https://www.redbullracing.com',
                season_results: {
                    points: 100,
                    driver_count: 2
                }
            },
            {
                id: 2,
                team_name: 'Mercedes',
                team_color: '#00D2BE',
                team_url: 'https://www.mercedesamgf1.com',
                season_results: {
                    points: 150,
                    driver_count: 2
                }
            },
            {
                id: 3,
                team_name: 'Ferrari',
                team_color: '#DC0000',
                team_url: 'https://www.ferrari.com/formula1',
                season_results: {
                    points: 200,
                    driver_count: 3
                }
            }
        ]

        it('should fetch all teams using api service', async () => {
            vi.mocked(f1DataService.getAllTeams).mockResolvedValue(mockTeamsFromAPI)

            const { result } = renderHook(() => useTeams(), { wrapper })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data).toEqual(mockTeamsFromAPI)
            expect(f1DataService.getAllTeams).toHaveBeenCalledTimes(1)
        })

        it('should handle server errors', async () => {
            vi.mocked(f1DataService.getAllTeams).mockRejectedValue(
                new Error('Internal Server Error')
            )

            const { result } = renderHook(() => useTeams(), { wrapper })
            
            await waitFor(() => {
                expect(result.current.isError).toBe(true)
            })

            expect(result.current.error).toBeDefined()
        })

        it('should handle empty team list', async () => {
            vi.mocked(f1DataService.getAllTeams).mockResolvedValue([])

            const { result } = renderHook(() => useTeams(), { wrapper })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data).toEqual([])
            expect(result.current.data).toHaveLength(0)
        })
    })
})