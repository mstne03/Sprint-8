import { useTeams } from "@/features/teams/hooks"
import ConstructorCard from "../ConstructorCard/ConstructorCard"
import { useDrivers } from "@/features/drivers/hooks";
import LoadingSpinner from '@/components/ui/LoadingSpinner/LoadingSpinner';
import ErrorMessage from '@/components/ui/ErrorMessage/ErrorMessage';
import EmptyState from '@/components/ui/EmptyState/EmptyState';

const ConstructorSection = () => {
    const { data: teams, isLoading: teamsLoading, isError: teamsError, error: teamsErrorData } = useTeams();
    const { data: drivers, isLoading: driversLoading, isError: driversError, error: driversErrorData } = useDrivers();

    if (teamsLoading || driversLoading) {
        return (
            <section>
                <LoadingSpinner message="Loading constructors..." />
            </section>
        );
    }

    if (teamsError || driversError) {
        const error = teamsErrorData || driversErrorData;
        return (
            <section>
                <ErrorMessage 
                    error={error as Error} 
                    title="Error loading constructors"
                />
            </section>
        );
    }

    if (!teams || teams.length === 0 || !drivers || drivers.length === 0) {
        return (
            <section>
                <EmptyState 
                    title="No constructors found"
                    description="No constructor data is currently available."
                />
            </section>
        );
    }
    
    return (
        <section>
            <div className="mx-15 grid md:grid-cols-1 grid-cols-1 gap-10 overflow-hidden">
                {teams
                    ?.sort((a, b) => {
                        const pointsA = drivers
                            ?.filter(driver => driver.team_name === a.team_name)
                            ?.reduce((total, driver) => total + (driver.season_results?.points || 0), 0) || 0;
                        
                        const pointsB = drivers
                            ?.filter(driver => driver.team_name === b.team_name)
                            ?.reduce((total, driver) => total + (driver.season_results?.points || 0), 0) || 0;
                        
                        return pointsB - pointsA;
                    })
                    ?.map(t => (
                        <ConstructorCard
                            key={t.team_name}
                            t={t}
                            d={drivers}
                        />
                    ))
                }
            </div>
        </section>
    )
}

export default ConstructorSection
