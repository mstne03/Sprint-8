import { Schema, model } from 'mongoose'

const DriverSeasonSchema = new Schema({
    driver_uid: { type: String, required: true },
    season: { type: Number, required: true },
    driver_number: { type: Number, required: true },
    broadcast_name: { type: String, required: true },
    name_acronym: { type: String, required: true },
    first_name: String,
    last_name: String,
    full_name: { type: String, required: true },
    team_name: { type: String, required: true },
    team_colour: { type: String, required: true },
    country_code: String,
    headshot_url: String,
}, { autoIndex: false });

DriverSeasonSchema.index({ driver_uid: 1, season: 1 }, { unique: true });

export const DriverSeason = model("DriverSeason", DriverSeasonSchema);

export const getDriversSeason = (season) => DriverSeason.find({ season });
export const addDriversSeason = (drivers) => DriverSeason.bulkWrite(drivers);
