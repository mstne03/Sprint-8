import { Schema, model } from 'mongoose'

const TeamSchema = new Schema({
    key: { type: String, required: true, unique: true },
    year: { type: Number, required: true },
    drivers: { type: [Schema.Types.ObjectId], required: true },
    raceResults: { type: [Number], required: false },
    qualiResults: { type: [Number], required: false },
    standings: { type: Number, required: false }
}, { timestamps: true });

TeamSchema.index({ key: 1, year: 1, drivers: 1 }, { unique: true });

export default model("Team", TeamSchema);