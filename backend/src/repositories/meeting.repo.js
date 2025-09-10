import { mapMeeting } from '../utils/map.js'

export function upsertMeeting (meeting) {
    const {
        circuit_key,
        circuit_short_name,
        country_code,
        country_key,
        country_name,
        date_start,
        location,
        meeting_key,
        meeting_name,
        year,
    } = mapMeeting(meeting);

    return {
        updateOne: {
            filter: {
                circuit_key,
                date_start,
                year,
            },
            update: {
                $set: {    
                    circuit_short_name,
                    country_code,
                    country_key,
                    country_name,
                    location,
                    meeting_key,
                    meeting_name,
                }
            },
            upsert: true,
        }
    }
}
