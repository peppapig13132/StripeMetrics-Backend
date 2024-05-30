import dotenv from 'dotenv';
import Stripe from 'stripe';
import moment from 'moment';

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRETKEY || '';
const stripe = new Stripe(stripeSecretKey);

export const getFirstDayOfTheMonth = (timestamp: number): number => {
  return moment.unix(timestamp).startOf('month').unix();
}

export const getDate30DaysBefore = (timestamp: number): number => {
  return moment.unix(timestamp).subtract(30, 'days').unix();
}

export const getFirstDayOfLastMonth = (timestamp: number): number => {
  return moment.unix(timestamp).startOf('month').subtract(1, 'months').unix();
}

export const getDaysOfTheMonth = (timestamp: number): number => {
  return moment.unix(timestamp).daysInMonth();
}

export const fetchSubscriptions = async (
    startDateTimestamp: number,
    endDateTimestamp: number,
    status: Stripe.Subscription.Status
  ): Promise<Stripe.Subscription[]> => {
  try {
    let allSubscriptions: Stripe.Subscription[] = [];
    let hasMore = true;
    let startingAfter: string | undefined = undefined;

    while (hasMore) {
      const params: Stripe.SubscriptionListParams = {
        created: {
          gte: startDateTimestamp,
          lte: endDateTimestamp,
        },
        status: status,
        limit: 100,
        starting_after: startingAfter,
      };

      const response = await stripe.subscriptions.list(params);
      allSubscriptions = allSubscriptions.concat(response.data);

      hasMore = response.has_more;
      if (hasMore) {
        startingAfter = response.data[response.data.length - 1].id;
      } else {
        startingAfter = undefined;
      }
    }

    return allSubscriptions;
  } catch (error) {
    console.error('Error fetching subscriptions from Stripe:', error);
    return [];
  }
};
