import express from 'express'
import cors from 'cors'
import { CORS_ORIGIN } from './config/index.js'
import f1Routes from './routes/f1.routes.js'

const app = express();

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

app.use('/api', f1Routes);

export default app;
