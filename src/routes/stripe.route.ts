import { Router } from 'express';
import {
  getMrrData,
  getNewSubscriptionWithDateRange,
  getMrrMovementsData,
  getAverageStaying,
} from '../controller/stripe.controller';

const router = Router();

router.post('/monthly-recurring-revenue', getMrrData);
router.post('/count-new-subscriptions', getNewSubscriptionWithDateRange);
router.post('/mrr-movements', getMrrMovementsData);
router.post('/average-staying', getAverageStaying);

export default router;
