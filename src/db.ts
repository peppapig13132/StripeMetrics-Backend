import DailyActiveSubscriptionCount from './model/dailyActiveSubscriptionCount.model';
import DailySum from './model/dailySum.model';
import User from './model/user.model';

const syncModels = async () => {
  try {
    // await User.sync({ force: true });
    // await DailySum.sync({ force: true });
    // await DailyActiveSubscriptionCount.sync({ force: true });
  } catch (error) {
    console.error('Error synchronizing models:', error);
  }
}

syncModels();
