import { Schema, model } from 'mongoose'

const SeasonSchema = new Schema({
    eventKeys: { type: [Schema.Types.ObjectId], ref: "Event", required: true },
    teams: { type: [Schema.Types.ObjectId], ref: "Team", required: true },
    year: { type: Number, required: true },
}, { timestamps: true });

SeasonSchema.index({ year: 1, eventKeys: 1, drivers: 1, teams: 1 }, { unique: true });

export default model("Season", SeasonSchema);