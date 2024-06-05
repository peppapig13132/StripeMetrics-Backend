import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import moment from 'moment';

class DailyActiveSubscriptionCount extends Model {}

DailyActiveSubscriptionCount.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    count: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    date: {
      type: DataTypes.DATE,
      defaultValue: moment().startOf('date').toDate(),
    },
  },
  {
    sequelize,
    modelName: 'DailyActiveSubscriptionCount'
  }
);

export default DailyActiveSubscriptionCount;