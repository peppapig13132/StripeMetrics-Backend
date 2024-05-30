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
  const today = moment().tz(SERVER_GMT);

  const startDateTimestampLast30Days = today.clone().subtract(30, 'days').unix();
  const endDateTimestampLast30Days = today.unix();

  try {
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
    const churnRate = await ChurnRate.create({
      rate: churnRateLast30Days,
      rate_type: 'LAST_30_DAYS',
    });
  } catch(error) {
    console.error('Error cronJob/customerChurnRateDaily:', error);
  }
});

cron.schedule(cronExpressionMonthly, async () => {
  const today = moment().tz(SERVER_GMT);

  const startDateTimestampLastMonth = today.clone().startOf('month').subtract(1, 'month').unix();
  const endDateTimestampLastMonth = today.clone().endOf('month').subtract(1, 'month').unix();

  try {
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
    const churnRate = await ChurnRate.create({
      rate: churnRateLastMonth,
      rate_type: 'LAST_MONTH',
    });
  } catch(error) {
    console.error('Error cronJob/customerChurnRateMonthly:', error);
  }
});