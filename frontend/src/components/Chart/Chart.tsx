import useChart from '@/hooks/useChart'
import useEvents from '@/hooks/useEvents'

function getSessionTypes(eventFormat:string) {
    if (eventFormat === "conventional") {
        return ["FP1", "FP2", "FP3", "Qualifying", "Race"]
    }

    return ["FP1", "SQ", "SR", "Qualifying", "Race"]
}

export default function Chart() {

    return (
        <>
            
        </>
    )
}
