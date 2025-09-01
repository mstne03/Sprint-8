import { openf1Get, paths } from '../services/openf1.rest.js'
import { upsertDriversSeason } from '../repositories/driver.repo.js'
import { DriverSeason } from '../models/Driver_Season.js'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function importSaveDriversSeason(req, res) {
    try {
        const years = req.query.years.split(',').map(y => y.trim());

        for (const year of years) {
            const driversRaw = [];
            const seenDrivers = [];

            const meetingsYear = await openf1Get(paths.meetings, { year });

            console.log("Meetings year:", meetingsYear)

            for (const meeting of meetingsYear) {
                const d = await openf1Get(paths.drivers, { meeting_key: meeting.meeting_key });
                driversRaw.push(d);
                await sleep(300);
            }

            console.log("Drivers Raw:", driversRaw);

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
        }

        res.status(200).json({ message: `Drivers successfully saved for ${years} seasons` });
    } catch (e) {
        res.status(401).json({ message: e.message });
    }
}
