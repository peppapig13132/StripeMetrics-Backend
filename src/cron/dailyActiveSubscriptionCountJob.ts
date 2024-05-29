import cron from 'node-cron';
import Stripe from 'stripe';
import moment from 'moment-timezone';
import { config } from 'dotenv';
import DailyActiveSubscriptionCount from '../model/dailyActiveSubscriptionCount.model';

config();

const stripeSecretKey = process.env.STRIPE_SECRETKEY || "";
const stripe = new Stripe(stripeSecretKey);

const SERVER_GMT = process.env.SERVER_GMT || 'UTC';
const cronExpression = process.env.SERVER_CRON_EXPRESSION || '0 0 0 * * *';

cron.schedule(cronExpression, async () => {
  const now = moment().tz(SERVER_GMT);

  let activeCount = 0;
  let hasMore = true;
  let startingAfter: string | undefined = undefined;

  try {
    while (hasMore) {
      const subscriptions: any = await stripe.subscriptions.list({
        status: 'all',
        limit: 100,
        starting_after: startingAfter,
      });

      subscriptions.data.forEach((subscription: Stripe.Subscription) => {
        const createdAt = moment.unix(subscription.created);
        const endedAt = subscription.ended_at ? moment.unix(subscription.ended_at) : null;
        
        if (createdAt.isBefore(now) && (!endedAt || endedAt.isAfter(now))) {
          activeCount++;
        }
      });

      hasMore = subscriptions.has_more;
      if (hasMore) {
        startingAfter = subscriptions.data[subscriptions.data.length - 1].id;
      }

      const dailyActiveSubscriptionCount = await DailyActiveSubscriptionCount.create({
        count: activeCount,
      })
    }
  } catch (error) {
    console.error('Error cronJob/dailyActiveSubscriptionCountJob:', error);
  }

});