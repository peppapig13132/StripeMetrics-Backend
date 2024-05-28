import cron from 'node-cron';
import Stripe from 'stripe';
import moment from 'moment-timezone';
import { config } from 'dotenv';
import DailySum from '../model/dailysum.model';

config();

const stripeSecretKey = process.env.STRIPE_SECRETKEY || "";
const stripe = new Stripe(stripeSecretKey);

const SERVER_GMT = process.env.SERVER_GMT || 'UTC';
const cronExpression = process.env.SERVER_CRON_EXPRESSION || '0 0 0 * * *';

cron.schedule(cronExpression, async () => {
  const now = moment().tz(SERVER_GMT);
  // const startOfToday = now.clone().startOf('day').unix();
  const endOfToday = now.clone().endOf('day').unix();
  const oneMonthBefore = now.clone().startOf('day').subtract(1, 'months').unix();

  try {
    const subscriptions = await stripe.subscriptions.list({
      created: {
        gte: oneMonthBefore,
        lt: endOfToday,
      },
      status: 'all',
    });

    const targetDate = new Date();
    const activeSubscriptions = subscriptions.data.filter(subscription => {
      const startDate = new Date(subscription.start_date * 1000);
      const endDate = subscription.ended_at ? new Date(subscription.ended_at * 1000) : null;

      return (startDate <= targetDate && (!endDate || endDate >= targetDate));
    });

    const totalSum = activeSubscriptions.reduce((sum, subscription) => {
      return sum + ((subscription.items.data[0].plan.amount || 0) / 100);
    }, 0);

    const dailySum = await DailySum.create({
      sum: totalSum,
    });

    console.log(`Total sum of active subscriptions for ${now.format('YYYY-MM-DD')}: $${totalSum}`);
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
  }
});
