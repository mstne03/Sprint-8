import { useTeams } from "@/features/teams/hooks"
import ConstructorCard from "../ConstructorCard/ConstructorCard"
import { useDrivers } from "@/features/drivers/hooks";

const ConstructorSection = () => {
    const { data: teams } = useTeams();
    const { data: drivers } = useDrivers();

    return (
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
    )
}

export default ConstructorSection
