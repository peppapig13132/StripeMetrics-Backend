import { Router } from "express";
import { signup } from "../controller/auth.controller";
import { checkDuplicatedEmail } from "../middleware/auth.middleware";

const router = Router();

router.post("/singup", checkDuplicatedEmail, signup);

export default router;
