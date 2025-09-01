import { openf1Get, paths } from '../services/openf1.rest.js'
import { mapDriverSeason } from '../utils/map.js'
import { DriverSeason } from '../models/Driver_Season.js'

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

export async function importSaveDriversSeason(req, res) {
    try {
        const years = req.query.years.split(',');

        for (const year of years) {
            const uniqueDrivers = [];

            const meetingsYear = await openf1Get(paths.meetings, { year });

            console.log(`Meetings ${year}: `, meetingsYear);

            const driversRaw = [];

            for (const meeting of meetingsYear) {
                const ds = await openf1Get(paths.drivers, { meeting_key: meeting.meeting_key });
                driversRaw.push(ds);
                await sleep(300);
            }

            console.log("Drivers Raw:", driversRaw);

            driversRaw.flat().forEach(d => {
                const DN = Number(d.driver_number);
                const exists = uniqueDrivers.some(driver => Number(driver.driver_number) === DN);

                if (!exists) {
                    uniqueDrivers.push(d);
                }
            })

            const mappedDrivers = uniqueDrivers.map(d => {
                const {
                    driver_uid,
                    season,
                    driver_number,
                    name_acronym,
                    full_name,
                    team_name,
                    team_color,
                    country_code,
                } = mapDriverSeason(d, year);

                return {
                        updateOne: {
                        filter: { 
                            driver_uid, 
                            season, 
                            driver_number, 
                            name_acronym, 
                            full_name, 
                            country_code,
                        },
                        update: { $set: {
                            team_name,
                            team_color,
                        }},
                        upsert: true,
                    }
                }
            });

            await DriverSeason.bulkWrite(mappedDrivers);
        }

        res.status(200).json({ message: `Drivers successfully saved for ${years} seasons` });
    } catch (e) {
        res.status(401).json({ message: e.message });
    }
}
