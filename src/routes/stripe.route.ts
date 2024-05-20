import { Router } from "express";
import { index } from "../controller/stripe.controller";

const router = Router();

router.post("/index", index);

export default router;
