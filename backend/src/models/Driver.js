import { Schema, model } from 'mongoose'

const DriverSchema = new Schema({
    driver_uid: { type: String, required: true },
    broadcast_name: { type: String, required: true },
    full_name: String,
    first_name: { type: String, required: true },
    last_name: String,
    name_acronym: { type: String, required: true },
    country_code: String,
    last_seen_season: Number,
}, { timestamps: true });

DriverSchema.index({ driver_uid: 1 }, { unique: true })

export default model("Driver", DriverSchema);
