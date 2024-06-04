import dotenv from 'dotenv';
import Stripe from 'stripe';
import moment from 'moment';

dotenv.config();

const stripeSecretKey = process.env.STRIPE_SECRETKEY || '';
const stripe = new Stripe(stripeSecretKey);

export const getFirstDateOfLastMonth = (): moment.Moment => {
  return moment().startOf('month').subtract(1, 'months');
}

export const getLastDateOfLastMonth = (): moment.Moment => {
  return moment().endOf('month').subtract(1, 'months');
}

export const fetchSubscriptions = async (
    startDateTimestamp: number,
    endDateTimestamp: number,
    status?: Stripe.Subscription.Status
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
          limit: 100,
          starting_after: startingAfter,
      };

      if (status) {
          params.status = status;
      }

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
}

export const fetchPaidInvoices = async (
  startDateTimestamp: number,
  endDateTimestamp: number,
): Promise<Stripe.Invoice[]> => {
  let allInvoices: Stripe.Invoice[] = [];
  let startingAfter: string | undefined = undefined;

  try {
    while(true) {
      const invoices: Stripe.ApiList<Stripe.Invoice> = await stripe.invoices.list({
        created: {
          gte: startDateTimestamp,
          lt: endDateTimestamp,
        },
        status: 'paid',
        starting_after: startingAfter,
        limit: 100,
      });

      allInvoices.push(...invoices.data);

      if(invoices.has_more) {
        startingAfter = invoices.data[invoices.data.length - 1].id;
      } else {
        break;
      }
    }
  } catch(error) {
    console.log('Error fetching paid invoices from Stripe:', error);
    return [];
  }

  return allInvoices;
}

export const calculateMrr = async (startDateTimestamp: number, endDateTimestamp: number): Promise<number> => {
  let mrr = 0;

  try {
    const invoices = await fetchPaidInvoices(startDateTimestamp, endDateTimestamp);

    invoices.forEach((invoice: Stripe.Invoice) => {
      invoice.lines.data.forEach((lineItem: Stripe.InvoiceLineItem) => {
        if(lineItem.type === 'subscription') {
          let amount = (lineItem.plan?.amount === null || lineItem.plan?.amount === undefined) ? 0 : lineItem.plan.amount;
          mrr += amount / 100;
        }
      })
    });

    return mrr;
  } catch(error) {
    console.log('Error calculating MRR from Stripe:', error);
    return 0;
  }
}