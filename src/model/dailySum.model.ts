import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';
import moment from 'moment';

class DailySum extends Model {}

DailySum.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    sum: {
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
    modelName: 'DailySum'
  }
);

export default DailySum;