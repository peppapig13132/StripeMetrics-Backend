import { Router } from 'express';
import {
  getMrrData,
  getNewSubscriptionWithDateRange,
  getMrrMovementsData,
  getAverageStaying,
  getChurnRate,
  getFreeToPaidSubscriptions,
  getFreeTrials,
} from '../controller/stripe.controller';

const router = Router();

router.post('/monthly-recurring-revenue', getMrrData);
router.post('/count-new-subscriptions', getNewSubscriptionWithDateRange);
router.post('/mrr-movements', getMrrMovementsData);
router.post('/average-staying', getAverageStaying);
router.post('/customer-churn-rate', getChurnRate)
router.post('/free-to-paid-subscriptions', getFreeToPaidSubscriptions);
router.post('/free-trials', getFreeTrials);

export default router;
