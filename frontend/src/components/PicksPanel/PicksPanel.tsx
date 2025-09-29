import type { Driver } from "@/features/drivers/types"
import type { Team } from "@/features/teams/types"

type PicksPanelProps = {
    drivers: Driver[],
    team: Team,
}

const PicksPanel = ({ drivers, team }: PicksPanelProps) => {
    return (
        <div>
            {drivers 
                ? drivers.map(d => {
                    return <p>{d.full_name}</p>
                })
                : <p>No drivers yet</p>
            }
            {team
                ? <p>{team.team_name}</p>
                : <p>No team yet</p>
            }
        </div>
    )
}

export default PicksPanel
