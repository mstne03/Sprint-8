import { openf1Get, paths } from '../services/openf1.rest.js'
import { upsertDriversSeason } from '../repositories/driver.repo.js'
import { DriverSeason } from '../models/DriverSeason.js'
import Meeting from '../models/Meeting.js'
import { sleep } from '../utils/sleep.js'

export async function importSaveDriversSeason() {
    try {
        const years = process.env.AVAILABLE_YEARS.split(',').map(Number);

        for (const year of years) {
            const driversRaw = [];
            const seenDrivers = [];

            const meetingsYear = await Meeting.find({ year });

            console.log("Meetings year:", meetingsYear)

            for (const meeting of meetingsYear) {
                const d = await openf1Get(paths.drivers, { meeting_key: meeting.meeting_key });
                driversRaw.push(d);
                await sleep(400);
            }

            const uniqueDrivers = driversRaw.flat().filter(d => {
                const number = Number(d.driver_number);

                if (seenDrivers.includes(number)) {
                    return false;
                };

                seenDrivers.push(number);

                return true;
            });

            const mappedDrivers = uniqueDrivers.map(d => upsertDriversSeason(d, year));

            await DriverSeason.bulkWrite(mappedDrivers);

            console.log("Successfully imported drivers by season docs");
        }
    } catch (e) {
        console.error("Error in importSaveDriversSeason:", e.message);
    }
}
