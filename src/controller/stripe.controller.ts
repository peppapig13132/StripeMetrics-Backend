import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';
import Stripe from 'stripe';
import moment from 'moment';
import { Op } from 'sequelize';
import { AuthRequest } from '../types/auto-request';
import DailySum from '../model/dailySum.model';
import { getFirstDayOfTheMonth, getDate30DaysBefore, getFirstDayOfLastMonth, fetchSubscriptions } from '../utils/utils';
import DailyActiveSubscriptionCount from '../model/dailyActiveSubscriptionCount.model';

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRETKEY || '';
const stripe = new Stripe(stripeSecretKey);

export const getMrrData = asyncHandler(async (req: AuthRequest, res: Response) => {
  if(stripeSecretKey == '') {
    res.json({
      ok: false,
      msg: 'stripe key is required',
    });
  }

  // Last 30 days
  const now = moment().unix();
  const thirtyDaysAgo = getDate30DaysBefore(now);

  const subscriptionsOfLast30Days = await stripe.subscriptions.list({
    created: {
      gte: thirtyDaysAgo,
      lte: now,
    },
  });

  const mrrCostOfLast30Days = subscriptionsOfLast30Days.data.reduce((totalMRR, subscription) => {
    const amount = subscription.items.data[0].plan.amount || 0;
    return totalMRR + amount;
  }, 0);

  const mrrOfLast30DaysInDollars = mrrCostOfLast30Days / 100;

  // Last month
  const firstDayOfLastMonth = getFirstDayOfLastMonth(now);
  const firstDayOfThisMonth = getFirstDayOfTheMonth(now);

  const subscriptionsOfLastMonth = await stripe.subscriptions.list({
    created: {
      gte: firstDayOfLastMonth,
      lte: firstDayOfThisMonth,
    },
  });

  const mrrCostOfLastMonth = subscriptionsOfLastMonth.data.reduce((totalMRR, subscription) => {
    const amount = subscription.items.data[0].plan.amount || 0;
    return totalMRR + amount;
  }, 0);

  const mrrOfLastMonthInDollars = mrrCostOfLastMonth / 100;


  const last30DailySums = await DailySum.findAll({
    order: [
      ['createdAt', 'DESC']
    ],
    limit: 30
  });

  res.json({
    ok: true,
    mrr_last_30days: mrrOfLast30DaysInDollars,
    mrr_last_month: mrrOfLastMonthInDollars,
    mrr_data: last30DailySums,
  });
})

export const getNewSubscriptionWithDateRange = asyncHandler(async (req: AuthRequest, res: Response) => {
  if(stripeSecretKey == '') {
    res.json({
      ok: false,
      msg: 'stripe key is required',
    });
  }

  // Last 30 days
  const now = moment().unix();
  const thirtyDaysAgo = getDate30DaysBefore(now);

  const subscriptionsOfLast30Days = await stripe.subscriptions.list({
    created: {
      gte: thirtyDaysAgo,
      lte: now,
    },
  });

  const countOfLast30Days = subscriptionsOfLast30Days.data.length;

  // Last month
  const firstDayOfLastMonth = getFirstDayOfLastMonth(now);
  const firstDayOfThisMonth = getFirstDayOfTheMonth(now);

  const subscriptionsOfLastMonth = await stripe.subscriptions.list({
    created: {
      gte: firstDayOfLastMonth,
      lte: firstDayOfThisMonth,
    },
  });

  const countOfLastMonth = subscriptionsOfLastMonth.data.length;

  res.json({
    ok: true,
    count_last_30days: countOfLast30Days,
    count_last_month: countOfLastMonth,
  });
});

export const getMrrMovementsData = asyncHandler(async (req: AuthRequest, res: Response) => {
  const last30DailySums = await DailySum.findAll({
    order: [
      ['createdAt', 'DESC']
    ],
    limit: 30,
  });

  res.json({
    ok: true,
    mrr_movements_data: last30DailySums,
  });
});

export const getAverageStaying = asyncHandler(async (req: AuthRequest, res: Response) => {
  // Last 30 days
  const countLast30Days = await DailyActiveSubscriptionCount.findAll({
    order: [
      ['createdAt', 'DESC'],
    ],
    limit: 30,
  });

  const totalCountLast30Days = countLast30Days.reduce((acc: number, dailyActiveSubscriptionCount: DailyActiveSubscriptionCount) => acc + dailyActiveSubscriptionCount.dataValues.count, 0)
  const averageStayingLast30Days = Math.round(totalCountLast30Days / 30);

  // Last month
  const today = moment();
  const lastMonthStart = today.clone().subtract(1, 'months').startOf('month');
  const lastMonthEnd = today.clone().subtract(1, 'months').endOf('month');
  const daysInLastMonth = lastMonthStart.daysInMonth();

  const countLastMonth = await DailyActiveSubscriptionCount.findAll({
    where: {
      createdAt: {
        [Op.between]: [lastMonthStart.toDate(), lastMonthEnd.toDate()]
      }
    }
  });

  const totalCountLastMonth = countLastMonth.reduce((acc: number, dailyActiveSubscriptionCount: DailyActiveSubscriptionCount) => acc + dailyActiveSubscriptionCount.dataValues.count, 0)
  const averageStayingLastMonth = Math.round(totalCountLastMonth / daysInLastMonth);

  res.json({
    ok: true,
    average_staying_last_30_days: averageStayingLast30Days,
    average_staying_last_month: averageStayingLastMonth,
  })
});

export const getChurnRate = asyncHandler(async (req: AuthRequest, res: Response) => {
  const today = moment();

  // Last 30 days
  const startDateTimestampLast30Days = today.clone().subtract(30, 'days').unix();
  const endDateTimestampLast30Days = today.unix();

  const activeSubscriptionsAtStartLast30Days = await fetchSubscriptions(startDateTimestampLast30Days, endDateTimestampLast30Days, 'active');
  const canceledSubscriptionsLast30Days = await fetchSubscriptions(startDateTimestampLast30Days, endDateTimestampLast30Days, 'canceled');

  const numberOfActiveSubscriptionsAtStartLast30Days = activeSubscriptionsAtStartLast30Days.length;
  const numberOfCanceledSubscriptionsLast30Days = canceledSubscriptionsLast30Days.length;

  let churnRateLast30Days = 0;

  if(numberOfActiveSubscriptionsAtStartLast30Days === 0) {
    churnRateLast30Days = 0
  } else {
    churnRateLast30Days = Math.round(numberOfCanceledSubscriptionsLast30Days / numberOfActiveSubscriptionsAtStartLast30Days / 100) * 10000;
  }

  // Last Month
  const startDateTimestampLastMonth = today.clone().subtract(30, 'days').unix();
  const endDateTimestampLastMonth = today.unix();

  const activeSubscriptionsAtStartLastMonth = await fetchSubscriptions(startDateTimestampLastMonth, endDateTimestampLastMonth, 'active');
  const canceledSubscriptionsLastMonth = await fetchSubscriptions(startDateTimestampLastMonth, endDateTimestampLastMonth, 'canceled');

  const numberOfActiveSubscriptionsAtStartLastMonth = activeSubscriptionsAtStartLastMonth.length;
  const numberOfCanceledSubscriptionsLastMonth = canceledSubscriptionsLastMonth.length;

  let churnRateLastMonth = 0;

  if(numberOfActiveSubscriptionsAtStartLastMonth === 0) {
    churnRateLastMonth = 0
  } else {
    churnRateLastMonth = Math.round(numberOfCanceledSubscriptionsLastMonth / numberOfActiveSubscriptionsAtStartLastMonth / 100) * 10000;
  }

  res.json({
    ok: true,
    churn_rate_last_30_days: churnRateLast30Days,
    churn_rate_last_month: churnRateLastMonth,
  })
});

export const getFreeToPaidSubscriptions = asyncHandler(async (req: AuthRequest, res: Response) => {
  const today = moment();

  // Last 30 days
  const subscriptionsLast30Days = await stripe.subscriptions.list({
    created: {
      gte: today.clone().subtract(30, 'days').unix(),
    },
  });

  const freeToPaidSubscriptionsLast30Days = subscriptionsLast30Days.data.filter((subscription) => {
    if (subscription.status !== 'active') {
      return false;
    }

    return subscription.items.data.some((item) => {
      return item.price.recurring?.interval !== undefined;
    });
  });

  const countFreeToPaidSubscriptionsLast30Days = freeToPaidSubscriptionsLast30Days.length;
  const countAllSubscriptionsLast30Days = subscriptionsLast30Days.data.length;

    // Last Month
    const subscriptionsLastMonth = await stripe.subscriptions.list({
      created: {
        gte: today.clone().subtract(1, 'months').startOf('month').unix(),
        lte: today.clone().startOf('month').unix(),
      },
    });
  
    const freeToPaidSubscriptionsLastMonth = subscriptionsLastMonth.data.filter((subscription) => {
      if (subscription.status !== 'active') {
        return false;
      }
  
      return subscription.items.data.some((item) => {
        return item.price.recurring?.interval !== undefined;
      });
    });
  
    const countFreeToPaidSubscriptionsLastMonth = freeToPaidSubscriptionsLastMonth.length;
    const countAllSubscriptionsLastMonth = subscriptionsLastMonth.data.length;

  res.json({
    ok: true,
    count_free_to_paid_last_30_days: countFreeToPaidSubscriptionsLast30Days,
    count_all_last_30_days: countAllSubscriptionsLast30Days,
    count_free_to_paid_last_month: countFreeToPaidSubscriptionsLastMonth,
    count_all_last_month: countAllSubscriptionsLastMonth,
  });
});

export const getFreeTrials = asyncHandler(async (req: AuthRequest, res: Response) => {
  const today = moment();

  // Last 30 days
  const subscriptionsLast30Days = await stripe.subscriptions.list({
    created: {
      gte: today.clone().subtract(30, 'days').unix(),
    },
  });

  const freeTrialsSubscriptionsLast30Days = subscriptionsLast30Days.data.filter((subscription) => {
    return subscription.trial_end && subscription.trial_end > subscription.created;
  });
  const countFreeTrialsSubscriptionsLast30Days = freeTrialsSubscriptionsLast30Days.length;

  const countAllSubscriptionsLast30Days = subscriptionsLast30Days.data.length;

  // Last month
  const subscriptionsLastMonth = await stripe.subscriptions.list({
    created: {
      gte: today.clone().subtract(1, 'months').startOf('month').unix(),
      lte: today.clone().startOf('month').unix(),
    },
  });

  const freeTrialsSubscriptionsLastMonth = subscriptionsLastMonth.data.filter((subscription) => {
    return subscription.trial_end && subscription.trial_end > subscription.created;
  });
  const countFreeTrialsSubscriptionsLastMonth = freeTrialsSubscriptionsLastMonth.length;

  const countAllSubscriptionsLastMonth = subscriptionsLastMonth.data.length;

  res.json({
    ok: true,
    count_free_trials_last_30_days: countFreeTrialsSubscriptionsLast30Days,
    count_all_last_30_days: countAllSubscriptionsLast30Days,
    count_free_trials_last_month: countFreeTrialsSubscriptionsLastMonth,
    count_all_last_month: countAllSubscriptionsLastMonth,
  });
});