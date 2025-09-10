import { mapQualiChart } from '../utils/map.js'

export function insertCharts (apiResponse) {

    const data = mapQualiChart(apiResponse);

    return data.map(obj => ({
        insertOne: {
            document: {...obj}
        }
    }));
}
