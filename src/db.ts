// import ActiveCustomerCount from './model/activeCustomerCount.model';
// import DailyActiveSubscriptionCount from './model/dailyActiveSubscriptionCount.model';
// import DailySum from './model/dailySum.model';
// import User from './model/user.model';
// import ChurnRate from './model/churnRate.model';
// import StripeOldData from './model/stripeOldData.model';

const syncModels: () => Promise<void> = async () => {
  try {
    // await User.sync({ force: true });
    // await DailySum.sync({ force: true });
    // await DailyActiveSubscriptionCount.sync({ force: true });
    // await ActiveCustomerCount.sync({force: true});
    // await ChurnRate.sync({force: true});
    // await StripeOldData.sync({force: true});
  } catch (error) {
    console.error('Error synchronizing models:', error);
  }
}

syncModels();
