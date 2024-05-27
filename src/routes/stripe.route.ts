import { Router } from "express";
import {
  getNewSubscriptionWithDateRange,
} from "../controller/stripe.controller";

const router = Router();

router.post("/count-new-subscriptions", getNewSubscriptionWithDateRange);

export default router;
