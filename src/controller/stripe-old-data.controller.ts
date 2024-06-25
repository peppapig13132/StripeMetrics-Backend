import { RequestHandler, Response } from 'express';
import asyncHandler from 'express-async-handler';
import moment from 'moment';
import { AuthRequest } from '../interfaces/interfaces';
import StripeOldData from '../model/stripeOldData.model';
import { calculateMrr, fetchSubscriptions } from '../utils/utils';
import ActiveCustomerCount from '../model/activeCustomerCount.model';
import DailyActiveSubscriptionCount from '../model/dailyActiveSubscriptionCount.model';
import DailySum from '../model/dailySum.model';

const getOldActiveCustomerCounts: (time: moment.Moment) => Promise<boolean> = async (time) => {
  try {
    const monthDays: number = time.daysInMonth();
    let result: boolean = true;

    for(let days = 0; days < monthDays; days ++) {
      try {
        if(time.clone().subtract(days, 'days').startOf('date').unix() > moment().startOf('date').unix()) continue;

        const subscriptions = await fetchSubscriptions(time.clone().subtract(30 + days - 1, 'days').startOf('date').unix(), time.clone().subtract(days - 1, 'days').startOf('date').unix(), 'active');
        const activeCustomerCount = await ActiveCustomerCount.create({
          count: subscriptions.length,
          date: time.clone().subtract(days - 1, 'days').startOf('date').toDate(),
        });

        result &&= true;
      } catch(error) {
        result &&= false;
        break;
      }
    }
    return result;
  } catch(error) {
    return false;
  }
}

const getOldDailyActiveSubscriptionCounts: (time: moment.Moment) => Promise<boolean> = async (time) => {
  try {
    const monthDays: number = time.daysInMonth();
    let result: boolean = true;

    for(let days = 0; days < monthDays; days ++) {
      try {
        if(time.clone().subtract(days, 'days').startOf('date').unix() > moment().startOf('date').unix()) continue;

        const activeSubscriptions = await fetchSubscriptions(time.clone().subtract(30 + days - 1, 'days').startOf('date').unix(), time.clone().subtract(days - 1, 'days').startOf('date').unix(), 'active');
        const dailyActiveSubscriptionCount = await DailyActiveSubscriptionCount.create({
          count: activeSubscriptions.length,
          date: time.clone().startOf('date').subtract(days - 1, 'days').toDate(),
        });

        result &&= true;
      } catch(error) {
        result &&= false;
        break;
      }
    }
    return result;
  } catch(error) {
    return false;
  }
}

const getOldDailySums: (time: moment.Moment) => Promise<boolean> = async (time) => {
  try {
    const monthDays: number = time.daysInMonth();
    let result: boolean = true;

    for(let days = 0; days < monthDays; days ++) {
      try {
        if(time.clone().subtract(30 + days - 1, 'days').startOf('date').unix() > moment().startOf('date').unix()) continue;

        const mrr = await calculateMrr(time.clone().subtract(30 + days - 1, 'days').startOf('date').unix(), time.clone().subtract(days - 1, 'days').startOf('date').unix())

        const dailySum = await DailySum.create({
          sum: mrr,
          date: time.clone().startOf('date').subtract(days - 1, 'days').toDate(),
        });
        
        result &&= true;
      } catch(error) {
        result &&= false;
        break;
      }
    }
    return result;
  } catch(error) {
    return false;
  }
}

export const createStripeOldData: RequestHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const time: moment.Moment = moment(req.body.date).endOf('month');

  const [activeCustomerCounts, dailyActiveSubscriptionCounts, dailySums,] = await Promise.all([
    getOldActiveCustomerCounts(time),
    getOldDailyActiveSubscriptionCounts(time),
    getOldDailySums(time),
  ]);
  
  const stripeOldDataRow = await StripeOldData.create({
    active_customer_counts: activeCustomerCounts,
    daily_active_subscription_counts: dailyActiveSubscriptionCounts,
    daily_sums: dailySums,
    date: time.clone().startOf('month').toDate(),
  });

  res.json({
    ok: true,
    result: stripeOldDataRow,
  });
});

export const getStripeOldData: RequestHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const stripeOldData = await StripeOldData.findAll({
    order: [['date', 'DESC']]
  });
  res.json({
    ok: true,
    stripe_old_data: stripeOldData,
  });
});