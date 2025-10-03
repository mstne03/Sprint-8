import { useNavigate } from "react-router-dom";
import { useBackendUser } from "./auth";
import { useDrivers } from "./drivers";
import { useTeams } from "./teams";
import { backendUserService } from "@/services";
import { usePicks } from "@/context/PicksContext";

const usePicksSubmission = () => {
    const { selectedDrivers, selectedConstructor, removeDriver, canContinue } = usePicks();
    const { data: drivers } = useDrivers();
    const { data: constructors } = useTeams();
    const { data: backendUser } = useBackendUser();
    const navigate = useNavigate();

    const driver_ids = drivers?.filter(d => selectedDrivers.some(selected => selected.full_name == d.full_name))
    const constructor = constructors?.find(c => c.team_name === selectedConstructor);

    const addUserTeam = async () => {
        if (canContinue && driver_ids?.length === 3 && backendUser?.id && constructor?.id) {
            try {
                await backendUserService.createUserTeam({
                    user_id: backendUser.id,
                    league_id: null,
                    team_name: null,
                    driver_1_id: driver_ids[0].id,
                    driver_2_id: driver_ids[1].id,
                    driver_3_id: driver_ids[2].id,
                    constructor_id: constructor.id,
                })
                navigate("/my-teams");
            } catch (error) {
                console.error(error)
            }
        } else {
            return;
        }
    }

    return {
        selectedDrivers,
        selectedConstructor,
        canContinue,
        addUserTeam,
        removeDriver,
    }
}

export default usePicksSubmission