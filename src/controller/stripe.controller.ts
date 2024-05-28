import { Response } from "express";
import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
import Stripe from "stripe";
import moment from 'moment';
import { AuthRequest } from "../types/auto-request";
import DailySum from "../model/dailysum.model";
import { getFirstDayOfTheMonth, getDate30DaysBefore, getFirstDayOfLastMonth } from "../utils/utils";

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRETKEY || "";
const stripe = new Stripe(stripeSecretKey);

export const getMrrData = asyncHandler(async (req: AuthRequest, res: Response) => {
  if(stripeSecretKey == "") {
    res.json({
      ok: false,
      msg: "stripe key is required",
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
  if(stripeSecretKey == "") {
    res.json({
      ok: false,
      msg: "stripe key is required",
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
    limit: 30
  });

  res.json({
    ok: true,
    mrr_movements_data: last30DailySums,
  });
});
