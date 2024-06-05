import cron from 'node-cron';
import moment from 'moment-timezone';
import { config } from 'dotenv';
import { fetchSubscriptions } from '../utils/utils';
import ChurnRate from '../model/churnRate.model';

config();

const SERVER_GMT = process.env.SERVER_GMT || 'UTC';
const cronExpressionDaily = process.env.SERVER_DAILY_CRON_EXPRESSION || '0 0 0 * * *';
const cronExpressionMonthly = process.env.SERVER_MONTHLY_CRON_EXPRESSION || '0 0 0 1 * *';

cron.schedule(cronExpressionDaily, async () => {
  try {
    const activeSubscriptionsAtStartLast30Days = await fetchSubscriptions(moment().subtract(30, 'days').unix(), moment().unix(), 'active');
    const canceledSubscriptionsLast30Days = await fetchSubscriptions(moment().subtract(30, 'days').unix(), moment().unix(), 'canceled');

    const numberOfActiveSubscriptionsAtStartLast30Days = activeSubscriptionsAtStartLast30Days.length;
    const numberOfCanceledSubscriptionsLast30Days = canceledSubscriptionsLast30Days.length;

    let churnRateLast30Days = 0;

    if(numberOfActiveSubscriptionsAtStartLast30Days === 0) {
      churnRateLast30Days = 0
    } else {
      churnRateLast30Days = Math.round(numberOfCanceledSubscriptionsLast30Days / numberOfActiveSubscriptionsAtStartLast30Days / 100) * 10000;
    }
    const churnRate = await ChurnRate.create({
      rate: churnRateLast30Days,
      rate_type: 'LAST_30_DAYS',
    });
  } catch(error) {
    console.error('Error cronJob/customerChurnRateDaily:', error);
  }
});

cron.schedule(cronExpressionMonthly, async () => {
  try {
    const activeSubscriptionsAtStartLastMonth = await fetchSubscriptions(moment().subtract(1, 'month').startOf('month').unix(), moment().subtract(1, 'month').endOf('month').unix(), 'active');
    const canceledSubscriptionsLastMonth = await fetchSubscriptions(moment().subtract(1, 'month').startOf('month').unix(), moment().subtract(1, 'month').endOf('month').unix(), 'canceled');

    const numberOfActiveSubscriptionsAtStartLastMonth = activeSubscriptionsAtStartLastMonth.length;
    const numberOfCanceledSubscriptionsLastMonth = canceledSubscriptionsLastMonth.length;

    let churnRateLastMonth = 0;

    if(numberOfActiveSubscriptionsAtStartLastMonth === 0) {
      churnRateLastMonth = 0
    } else {
      churnRateLastMonth = Math.round(numberOfCanceledSubscriptionsLastMonth / numberOfActiveSubscriptionsAtStartLastMonth / 100) * 10000;
    }
    const churnRate = await ChurnRate.create({
      rate: churnRateLastMonth,
      rate_type: 'LAST_MONTH',
    });
  } catch(error) {
    console.error('Error cronJob/customerChurnRateMonthly:', error);
  }
});