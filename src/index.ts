import './db';
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import router from "./routes";

dotenv.config();

const SERVER_GMT = process.env.SERVER_GMT || 'UTC';
process.env.TZ = SERVER_GMT;

const app = express();

const port = process.env.APP_PORT || 8000;

app.use(cors());
app.use(express.json());

router(app);

import './cron';

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
