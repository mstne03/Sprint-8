import { Schema, model } from 'mongoose'

const MeetingSchema = new Schema({
    circuit_key: { type: Number, required: true, },
    circuit_short_name: String,
    country_code: String,
    country_key: Number,
    country_name: { type: String, required: true, },
    date_start: { type: String, required: true, },
    location: String,
    meeting_key: { type: Number, required: true, },
    meeting_name: { type: String, required: true, },
    year: { type: Number, required: true, },
}, { timestamps: true, })

export default model("Meeting", MeetingSchema);
