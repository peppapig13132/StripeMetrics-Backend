import { Router } from 'express';
import {
  createStripeOldData,
  getStripeOldData,
} from '../controller/stripe-old-data.controller';

const router: Router = Router();

router.post('/', createStripeOldData);
router.get('/', getStripeOldData);

export default router;