import express, {Request, Response} from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import router from "./routes";

dotenv.config();

const app = express();

const port = process.env.APP_PORT || 8000;

app.use(cors());
app.use(express.json());

router(app);

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
