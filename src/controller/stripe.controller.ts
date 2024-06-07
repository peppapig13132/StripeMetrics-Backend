import { RequestHandler, Response } from 'express';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';
import moment from 'moment';
import { Op } from 'sequelize';
import { AuthRequest } from '../interfaces/interfaces';
import { fetchPaidInvoices, calculateMrr, getLastDateOfLastMonth, getFirstDateOfLastMonth, fetchSubscriptions } from '../utils/utils';
import DailySum from '../model/dailySum.model';
import DailyActiveSubscriptionCount from '../model/dailyActiveSubscriptionCount.model';
import ChurnRate from '../model/churnRate.model';
import ActiveCustomerCount from '../model/activeCustomerCount.model';

dotenv.config();

export const getMrrData: RequestHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const startDate: moment.Moment = moment(req.body.start_date);
  const endDate: moment.Moment = moment(req.body.end_date);

  const mrr = await calculateMrr(endDate.clone().subtract(1, 'months').unix(), endDate.clone().unix());

  const mrrArray = await DailySum.findAll({
    order: [
      ['date', 'DESC']
    ],
    where: {
      date: {
        [Op.between]: [startDate.clone().toDate(), endDate.clone().toDate()]
      },
    },
  });

  res.json({
    ok: true,
    mrr: mrr,
    mrr_array: mrrArray,
  });
});

export const countNewSubscriptions: RequestHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const countLast30Days = (await fetchSubscriptions(moment().subtract(30, 'days').unix(), moment().unix())).length;
  const countLastMonth = (await fetchSubscriptions(getFirstDateOfLastMonth().unix(), getLastDateOfLastMonth().unix())).length;

  res.json({
    ok: true,
    count_last_30days: countLast30Days,
    count_last_month: countLastMonth,
  });
});

export const getMrrMovementsData: RequestHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const startDate: moment.Moment = moment(req.body.start_date);
  const endDate: moment.Moment = moment(req.body.end_date);

  const mrrArray = await DailySum.findAll({
    order: [
      ['date', 'DESC']
    ],
    where: {
      date: {
        [Op.between]: [startDate.clone().toDate(), endDate.clone().toDate()]
      },
    }
  });

  res.json({
    ok: true,
    mrr_array: mrrArray,
  });
});

export const getAverageStaying: RequestHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const startDate: moment.Moment = moment(req.body.start_date);
  const endDate: moment.Moment = moment(req.body.end_date);
  const days = endDate.diff(startDate, 'days');

  const averageStayings = await DailyActiveSubscriptionCount.findAll({
    order: [
      ['date', 'DESC'],
    ],
    where: {
      date: {
        [Op.between]: [startDate.clone().toDate(), endDate.clone().toDate()]
      },
    },
  });

  const totalCount = averageStayings.reduce((acc: number, dailyActiveSubscriptionCount: DailyActiveSubscriptionCount) => acc + dailyActiveSubscriptionCount.dataValues.count, 0)
  const averageStaying = Math.round(totalCount / days);

  res.json({
    ok: true,
    average_staying: averageStaying,
  })
});

export const getCustomerLifetimeValue: RequestHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const startOfLastMonth = getFirstDateOfLastMonth();
  const endOfLastMonth = getLastDateOfLastMonth();

  const paidInvoices = await fetchPaidInvoices(startOfLastMonth.unix(), endOfLastMonth.unix());

  const totalRevenue = paidInvoices.reduce((total, invoice) => {
    return total + invoice.amount_paid;
  }, 0);

  const activeCustomerLastMonthData = await ActiveCustomerCount.findOne({
    where: {
      createdAt: {
        [Op.between]: [startOfLastMonth.toDate(), endOfLastMonth.toDate()]
      },
    },
    order: [['date', 'DESC']],
  });
  const activeCustomerLastMonth = activeCustomerLastMonthData ? activeCustomerLastMonthData.dataValues.count : 0;

  const churnRateData = await ChurnRate.findOne({
    where: {
      rate_type: 'LAST_MONTH',
    },
    order: [['date', 'DESC']],
  });
  const churnRateLastMonth = churnRateData ? churnRateData.dataValues.rate : 0;

  let customerLifetimeValue = 0;

  if(activeCustomerLastMonth !== 0 && churnRateLastMonth !== 0) {
    const averageMonthlyRevenuePerUser = totalRevenue / activeCustomerLastMonth;
    const customerLifetime = 1 / churnRateLastMonth;
    customerLifetimeValue = averageMonthlyRevenuePerUser * customerLifetime;
  } else {
    customerLifetimeValue = 0;
  }
  
  res.json({
    ok: true,
    customer_lifetime_value: customerLifetimeValue,
  })
});

export const getChurnRate: RequestHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const startDate: moment.Moment = moment(req.body.start_date);
  const endDate: moment.Moment = moment(req.body.end_date);

  const churnRate = await ChurnRate.findOne({
    where: {
      rate_type: 'LAST_30_DAYS',
      date: {
        [Op.between]: [startDate.clone().toDate(), endDate.clone().toDate()]
      }
    },
    order: [['date', 'DESC']],
  });

  res.json({
    ok: true,
    churn_rate: churnRate?.dataValues.rate,
  })
});

export const getFreeToPaidSubscriptions: RequestHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const startDate: moment.Moment = moment(req.body.start_date);
  const endDate: moment.Moment = moment(req.body.end_date);

  const countFreeToPaidSubscriptions = (await fetchSubscriptions(startDate.unix(), endDate.unix(), 'active')).length;
  const countAllSubscriptions = (await fetchSubscriptions(startDate.unix(), endDate.unix())).length;

  res.json({
    ok: true,
    count_free_to_paid: countFreeToPaidSubscriptions,
    count_all: countAllSubscriptions,
  });
});

export const getFreeTrials: RequestHandler = asyncHandler(async (req: AuthRequest, res: Response) => {
  const today = moment();

  // Last 30 days
  const subscriptionsLast30Days = await fetchSubscriptions(moment().subtract(30, 'days').unix(), moment().unix());
  const freeTrialsSubscriptionsLast30Days = subscriptionsLast30Days.filter((subscription) => {
    return  subscription.trial_end &&
            subscription.trial_end > moment().subtract(30, 'days').unix() &&
            subscription.trial_end < moment().unix();
  });
  const countFreeTrialsSubscriptionsLast30Days = freeTrialsSubscriptionsLast30Days.length;
  const countAllSubscriptionsLast30Days = subscriptionsLast30Days.length;

  // Last month
  const subscriptionsLastMonth = await fetchSubscriptions(getFirstDateOfLastMonth().unix(), getLastDateOfLastMonth().unix());
  const freeTrialsSubscriptionsLastMonth = subscriptionsLastMonth.filter((subscription) => {
    return  subscription.trial_end &&
            subscription.trial_end > getFirstDateOfLastMonth().unix() &&
            subscription.trial_end < getLastDateOfLastMonth().unix();
  });
  const countFreeTrialsSubscriptionsLastMonth = freeTrialsSubscriptionsLastMonth.length;
  const countAllSubscriptionsLastMonth = subscriptionsLastMonth.length;

  res.json({
    ok: true,
    count_free_trials_last_30_days: countFreeTrialsSubscriptionsLast30Days,
    count_all_last_30_days: countAllSubscriptionsLast30Days,
    count_free_trials_last_month: countFreeTrialsSubscriptionsLastMonth,
    count_all_last_month: countAllSubscriptionsLastMonth,
  });
});