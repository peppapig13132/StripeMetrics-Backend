import cron from 'node-cron';
import moment from 'moment-timezone';
import { config } from 'dotenv';
import DailySum from '../model/dailySum.model';
import { fetchSubscriptions } from '../utils/utils';

config();

const cronExpression = process.env.SERVER_DAILY_CRON_EXPRESSION || '0 0 0 * * *';

cron.schedule(cronExpression, async () => {
  try {
    const activeSubscriptions = await fetchSubscriptions(moment().subtract(31, 'days').unix(), moment().unix(), 'active');

    const totalSum = activeSubscriptions.reduce((sum, subscription) => {
      return sum + ((subscription.items.data[0].plan.amount || 0) / 100);
    }, 0);

    const dailySum = await DailySum.create({
      sum: totalSum,
    });

    console.log(`31days revenue: $${totalSum}. ${moment().format('YYYY/MM/DD')}`);
  } catch (error) {
    console.error('Error cronJob/subscriptionSumJob:', error);
  }
});
