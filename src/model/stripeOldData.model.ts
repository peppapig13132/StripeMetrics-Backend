import { Model, DataTypes } from 'sequelize';
import moment from 'moment';
import sequelize from '../config/database';

class StripeOldData extends Model {}

StripeOldData.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    active_customer_counts: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    churn_rates: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    daily_active_subscription_counts: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    daily_sums: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: moment().toDate(),
    },
  },
  {
    sequelize,
    modelName: 'StripeOldData',
  },
);

export default StripeOldData;