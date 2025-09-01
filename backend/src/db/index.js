import mongoose from 'mongoose'

const connectDB = (MONGO_URL) => {
    return mongoose.connect(MONGO_URL);
}

export default connectDB;
