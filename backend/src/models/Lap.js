import { Schema, model } from 'mongoose'

const schema = new Schema({
    date_start: String,
    driver_number: Number,
    duration_sector_1: Number,
    duration_sector_2: Number,
    duration_sector_3: Number,
    i1_speed: Number,
    i2_speed: Number,
    is_pit_out_lap: Boolean,
    lap_duration: Number,
    lap_number: Number,
    meeting_key: Number,
    segments_sector_1: Array,
    segments_sector_2: Array,
    segments_sector_3: Array,
    session_key: Number,
    st_speed: Number,
}, { timestamps: true });

export default model("Lap", schema);
