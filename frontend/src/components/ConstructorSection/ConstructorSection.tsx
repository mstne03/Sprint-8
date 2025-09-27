import { useTeams } from "@/features/teams/hooks"
import ConstructorCard from "../ConstructorCard/ConstructorCard"

const ConstructorSection = () => {
    const { data: teams } = useTeams();

    return (
        <>
            {teams?.map(t => (
                <ConstructorCard 
                    t={t}
                />
            ))}
        </>
    )
}

export default ConstructorSection
