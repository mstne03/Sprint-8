import type { Team } from "@/features/teams/types"
import { Canvas } from '@react-three/fiber'
import { CameraControls, PerspectiveCamera } from '@react-three/drei'
import MclarenModel from '@/components/Models/mclaren'

type ConstructorCardProps = {
    t: Team
}


const ConstructorCard = ({ t }: ConstructorCardProps) => {


    return (
        <div className="border-2 h-[700px] my-5 rounded-md"
            style={{
                background: `${t.team_color}35`
            }}
        >
            {t.team_name}
        </div>
    )
}

export default ConstructorCard
