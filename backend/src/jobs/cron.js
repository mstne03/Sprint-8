import cron from 'node-cron';
import { fetchAndSaveMeetings } from '../controllers/meetings.controller.js'
import { importSaveDriversSeason } from '../controllers/driversSeason.controller.js'
import { importSaveDrivers } from '../controllers/drivers.controller.js'
import { importSaveCharts } from '../controllers/charts.controller.js'

export default function fillDB() {
    cron.schedule('*/2 * * * *', async () => {
        try {
            /*await fetchAndSaveMeetings();
            await importSaveDriversSeason();
            await importSaveDrivers();*/
            await importSaveCharts();
        } catch(e) {
            console.error("Error in fillDB cron-job function", e.message);
        }
    }, { noOverlap: true });
}
