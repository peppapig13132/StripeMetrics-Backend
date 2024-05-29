import { Router } from 'express';
import {
  getMrrData,
  getNewSubscriptionWithDateRange,
  getMrrMovementsData,
  getAverageStaying,
  getFreeToPaidSubscriptions,
} from '../controller/stripe.controller';

const router = Router();

router.post('/monthly-recurring-revenue', getMrrData);
router.post('/count-new-subscriptions', getNewSubscriptionWithDateRange);
router.post('/mrr-movements', getMrrMovementsData);
router.post('/average-staying', getAverageStaying);
router.post('/free-to-paid-subscriptions', getFreeToPaidSubscriptions);

export default router;
