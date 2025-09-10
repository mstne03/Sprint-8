import { fastF1Get, paths } from '../services/fastf1.rest.js'
import Chart from '../models/Chart.js'
import { insertCharts } from '../repositories/charts.repo.js'

export async function importSaveCharts() {
    try {
        const years = process.env.AVAILABLE_YEARS.split(',').map(Number);

        const chartsArray = await fastF1Get(paths.quali_chart, { years });

        const ops = insertCharts(chartsArray);

        await Chart.bulkWrite(ops);

        console.log("Successfully imported svg charts");
    } catch (e) {
        console.error("Error in importSaveCharts:", e.message);
    }
}
