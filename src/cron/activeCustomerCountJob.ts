import cron from 'node-cron';
import moment from 'moment-timezone';
import { config } from 'dotenv';
import { fetchSubscriptions } from '../utils/utils';
import ActiveCustomerCount from '../model/activeCustomerCount.model';

config();

const SERVER_GMT = process.env.SERVER_GMT || 'UTC';
const cronExpression = process.env.SERVER_CRON_EXPRESSION || '0 0 0 * * *';

cron.schedule(cronExpression, async () => {
  const now = moment().tz(SERVER_GMT);

  const startDateTimestamp = now.clone().subtract(30, 'days').unix();
  const endDateTimestamp = now.unix();

  try {
    const subscriptions = await fetchSubscriptions(startDateTimestamp, endDateTimestamp, 'active');
    const activeCustomerCount = await ActiveCustomerCount.create({
      count: subscriptions.length,
    });
  } catch(error) {
    console.error('Error cronJob/activeCustomerCountCountJob:', error);
  }
});