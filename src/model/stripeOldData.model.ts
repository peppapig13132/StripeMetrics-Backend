import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class StripeOldData extends Model {}

StripeOldData.init(
  {
    id: {
      type: DataTypes.NUMBER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.ENUM(
        'active_customer_counts',
        'churn_rates',
        'daily_active_subscription_counts',
        'daily_sums',
      ),
      allowNull: false,
    },
    done: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    }
  },
  {
    sequelize,
    modelName: 'StripeOldData',
  },
);

export default StripeOldData;