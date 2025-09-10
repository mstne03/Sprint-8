import { DriverSeason } from '../models/DriverSeason.js'
import { upsertDrivers } from '../repositories/driver.repo.js'
import Driver from '../models/Driver.js'

export async function importSaveDrivers() {
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
            return upsertDrivers(doc)
        });

        await Driver.bulkWrite(mappedDrivers);

        console.log("Successfully imported drivers identity docs");
    } catch (e) {
        console.error("Error in importSaveDrivers:", e.message);
    }
}
