import { Schema, model } from 'mongoose'

const ChartSchema = new Schema({
    key: { type: String, required: true, unique: true },
    searchKey: { type: String, required: true, unique: true },
    team: { type: String, required: true },
    drivers: { type: [String], required: true },
    driversAcr: { type: [String], required: true },
    chartType: { type: String, required: true },
    sessionType: { type: String, required: true },
    year: { type: Number, required: true },
    svg: { type: String, required: true, unique: true },
    eventName: { type: String, required: true }
}, { timestamps: true });

ChartSchema.index({ key: 1, chartType: 1, drivers: 1, drivers_acr: 1, team: 1 }, { unique: true });

export default model("Chart", ChartSchema);
