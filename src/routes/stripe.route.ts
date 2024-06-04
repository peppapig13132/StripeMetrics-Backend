import { Router } from 'express';
import {
  getMrrData,
  countNewSubscriptions,
  getMrrMovementsData,
  getAverageStaying,
  getCustomerLifetimeValue,
  getChurnRate,
  getFreeToPaidSubscriptions,
  getFreeTrials,
} from '../controller/stripe.controller';

const router: Router = Router();

router.post('/monthly-recurring-revenue', getMrrData);
router.post('/count-new-subscriptions', countNewSubscriptions);
router.post('/mrr-movements', getMrrMovementsData);
router.post('/average-staying', getAverageStaying);
router.post('/customer-lifetime-value', getCustomerLifetimeValue);
router.post('/customer-churn-rate', getChurnRate);
router.post('/free-to-paid-subscriptions', getFreeToPaidSubscriptions);
router.post('/free-trials', getFreeTrials);

export default router;
