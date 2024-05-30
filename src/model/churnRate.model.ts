import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

class ChurnRate extends Model {}

ChurnRate.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    rate: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
    },
    rate_type: {
      type: DataTypes.ENUM(
        'LAST_MONTH',
        'LAST_30_DAYS',
      ),
      defaultValue: 'LAST_30_DAYS',
    }
  },
  {
    sequelize,
    modelName: 'ChurnRate'
  }
);

export default ChurnRate;