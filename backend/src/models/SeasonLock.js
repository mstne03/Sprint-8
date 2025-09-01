import { Schema, model } from 'mongoose'

const SeasonLockSchema = new Schema({
    _id: { type: String, required: true },
    until: { type: Date, required: true },
});

export default model("SeasonLock", SeasonLockSchema);
