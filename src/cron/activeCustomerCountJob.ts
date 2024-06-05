import cron from 'node-cron';
import moment from 'moment';
import { config } from 'dotenv';
import { fetchSubscriptions } from '../utils/utils';
import ActiveCustomerCount from '../model/activeCustomerCount.model';

config();

const cronExpression = process.env.SERVER_DAILY_CRON_EXPRESSION || '0 0 0 * * *';

cron.schedule(cronExpression, async () => {
  try {
    const subscriptions = await fetchSubscriptions(moment().subtract(30, 'days').unix(), moment().unix(), 'active');
    const activeCustomerCount = await ActiveCustomerCount.create({
      count: subscriptions.length,
    });
  } catch(error) {
    console.error('Error cronJob/activeCustomerCountCountJob:', error);
  }
});