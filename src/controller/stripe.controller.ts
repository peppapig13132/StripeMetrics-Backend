import { RequestHandler, Response } from 'express';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';
import moment from 'moment';
import { Op } from 'sequelize';
import { AuthRequest } from '../interfaces/interfaces';
import { fetchPaidInvoices, calculateMrr, fetchSubscriptions } from '../utils/utils';
import DailySum from '../model/dailySum.model';
import DailyActiveSubscriptionCount from '../model/dailyActiveSubscriptionCount.model';
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
  const startDate: moment.Moment = moment(req.body.start_date);
  const endDate: moment.Moment = moment(req.body.end_date);

  const countSubscriptions = (await fetchSubscriptions(startDate.unix(), endDate.unix())).length;

  res.json({
    ok: true,
    count_subscriptions: countSubscriptions,
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
  // const startDate: moment.Moment = moment(req.body.start_date);
  const endDate: moment.Moment = moment(req.body.end_date);
  const startDate: moment.Moment = endDate.clone().subtract(1, 'months');

  const paidInvoices = await fetchPaidInvoices(startDate.unix(), endDate.unix());

  const totalRevenue = paidInvoices.reduce((total, invoice) => {
    return total + invoice.amount_paid;
  }, 0);

  const activeCustomerLastMonthData = await ActiveCustomerCount.findOne({
    where: {
      date: {
        [Op.between]: [startDate.toDate(), endDate.toDate()]
      },
    },
    order: [['date', 'DESC']],
  });
  const activeCustomerLastMonth = activeCustomerLastMonthData ? activeCustomerLastMonthData.dataValues.count : 0;

  const activeCustomerCountAtStart = await ActiveCustomerCount.findOne({
    where: {
      date: {
        [Op.eq]: startDate.toDate()
      }
    }
  });
  const activeCustomerCountAtEnd = await ActiveCustomerCount.findOne({
    where: {
      date: {
        [Op.eq]: endDate.toDate()
      }
    }
  });
  
  const countAtStart = activeCustomerCountAtStart ? activeCustomerCountAtStart.dataValues.count : 0;
  const countAtEnd = activeCustomerCountAtEnd ? activeCustomerCountAtEnd.dataValues.count : 0;

  const churnRate = (countAtStart !== 0) ? (Math.round((countAtStart - countAtEnd) / countAtStart * 100) / 100) : 0;

  let customerLifetimeValue = 0;

  if(activeCustomerLastMonth !== 0 && churnRate !== 0) {
    const averageMonthlyRevenuePerUser = totalRevenue / activeCustomerLastMonth;
    const customerLifetime = 1 / churnRate;
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

  const activeCustomerCountAtStart = await ActiveCustomerCount.findOne({
    where: {
      date: {
        [Op.eq]: startDate.toDate()
      }
    }
  });
  const activeCustomerCountAtEnd = await ActiveCustomerCount.findOne({
    where: {
      date: {
        [Op.eq]: endDate.toDate()
      }
    }
  });

  const countAtStart = activeCustomerCountAtStart ? activeCustomerCountAtStart.dataValues.count : 0;
  const countAtEnd = activeCustomerCountAtEnd ? activeCustomerCountAtEnd.dataValues.count : 0;

  const churnRate = (countAtStart !== 0) ? (Math.round((countAtStart - countAtEnd) / countAtStart * 100) / 100) : 0;

  res.json({
    ok: true,
    churn_rate: churnRate,
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
  const startDate: moment.Moment = moment(req.body.start_date);
  const endDate: moment.Moment = moment(req.body.end_date);

  const subscriptions = await fetchSubscriptions(startDate.unix(), endDate.unix());
  const freeTrialsSubscriptions = subscriptions.filter((subscription) => {
    return  subscription.trial_end &&
            subscription.trial_end > moment().subtract(30, 'days').unix() &&
            subscription.trial_end < moment().unix();
  });
  const countFreeTrialsSubscriptions = freeTrialsSubscriptions.length;

  res.json({
    ok: true,
    free_trials: countFreeTrialsSubscriptions,
  });
});