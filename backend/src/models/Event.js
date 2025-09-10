import { Schema, model } from 'mongoose'

const EventSchema = new Schema({
    key: { type: String, required: true, unique: true },
    year: { type: Number, required: true },
    eventName: { type: String, required: true },
    sessions: { type: [Schema.Types.ObjectId], ref: "Session", required: true },
    drivers: { type: [Schema.Types.ObjectId], ref: "Driver", required: true }
}, { timestamps: true });

EventSchema.index({ key: 1, year: 1, eventName: 1, drivers: 1 }, { unique: true });

export default model("Event", EventSchema);