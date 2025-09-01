import { mapDriver } from '../utils/map.js'
import { DriverSeason } from '../models/Driver_Season.js'
import Driver from '../models/Driver.js'

export async function importSaveDrivers(req, res) {
    try {
        const uniqueDrivers = await DriverSeason.aggregate([
            { $sort: { driver_uid: 1, season: -1 } },
            {
                $group: {
                    _id: "$driver_uid",
                    doc: { $first: "$$ROOT" },
                }
            },
        ]);

        const mappedDrivers = uniqueDrivers.map(({ doc }) => {
            console.log("Driver number:", doc.driver_number, "Team name: ", doc.team_name)

            const {
                driver_uid,
                last_seen_season,
                driver_number,
                name_acronym,
                full_name,
                team_name,
                team_color,
                country_code,
            } = mapDriver(doc, doc.season);

            return {
                updateOne: {
                    filter: { driver_uid },
                    update: { 
                        $set: {
                            driver_number,
                            name_acronym,
                            full_name,
                            team_name,
                            team_color,
                            country_code,
                            last_seen_season,
                        },
                    },
                    upsert: true,
                }
            }
        });

        await Driver.bulkWrite(mappedDrivers);

        res.status(200).json({ message: `Driver profiles successfully saved` });
    } catch (e) {
        console.log("Error:", e.message);
        res.status(401).json({ message: e.message });
    }
}
