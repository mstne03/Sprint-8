import { Schema, model } from 'mongoose'

const DriverSchema = new Schema({
    driverUid: { type: String, required: true, unique: true },
    fullName: { type: String, required: true },
    nameAcronym: { type: String, required: true },
    team: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    raceResults: { type: [Number], required: false },
    qualiResults: { type: [Number], required: false },
    countryCode: String,
    year: { type: Number, required: true },
    season: { type: Schema.Types.ObjectId, ref: "Season", required: true },
}, { timestamps: true });

DriverSchema.index({ driverUid: 1, nameAcronym: 1, year: 1 }, { unique: true })

export default model("Driver", DriverSchema);
