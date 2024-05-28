import { Router } from "express";
import {
  getMrrData,
  getNewSubscriptionWithDateRange,
  getMrrMovementsData,
} from "../controller/stripe.controller";

const router = Router();

router.post("/monthly-recurring-revenue", getMrrData);
router.post("/count-new-subscriptions", getNewSubscriptionWithDateRange);
router.post("/mrr-movements", getMrrMovementsData);

export default router;
