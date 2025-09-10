import dotenv from 'dotenv'

dotenv.config();

export const PORT = Number(process.env.PORT ?? 700);
export const MONGO_URL = process.env.MONGO_URL;
export const SECOND_MONGO_URL = process.env.SECOND_MONGO_URL;
export const CORS_ORIGIN = process.env.CORS_ORIGIN;