import cron from 'node-cron';
import moment from 'moment-timezone';
import { config } from 'dotenv';
import DailyActiveSubscriptionCount from '../model/dailyActiveSubscriptionCount.model';
import { fetchSubscriptions } from '../utils/utils';

config();

const cronExpression = process.env.SERVER_DAILY_CRON_EXPRESSION || '0 0 0 * * *';

cron.schedule(cronExpression, async () => {
  try {
    const activeSubscriptions = await fetchSubscriptions(moment().subtract(31, 'month').unix(), moment().unix(), 'active');
    const dailyActiveSubscriptionCount = await DailyActiveSubscriptionCount.create({
      count: activeSubscriptions.length,
    })
  } catch (error) {
    console.error('Error cronJob/dailyActiveSubscriptionCountJob:', error);
  }

});