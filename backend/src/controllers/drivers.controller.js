import { DriverSeason } from '../models/Driver_Season.js'
import Driver from '../models/Driver.js'
import { upsertDrivers } from '../repositories/driver.repo.js'

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

        const mappedDrivers = uniqueDrivers.map(({ doc }) => upsertDrivers(doc));

        await Driver.bulkWrite(mappedDrivers);

        res.status(200).json({ message: `Driver profiles successfully saved` });
    } catch (e) {
        console.log("Error:", e.message);
        res.status(401).json({ message: e.message });
    }
}
