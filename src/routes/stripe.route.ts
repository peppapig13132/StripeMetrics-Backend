import { Router } from "express";
import {
  getMrrMovementsData,
  getNewSubscriptionWithDateRange,
} from "../controller/stripe.controller";

const router = Router();

router.post("/mrr-movements", getMrrMovementsData);
router.post("/count-new-subscriptions", getNewSubscriptionWithDateRange);

export default router;
