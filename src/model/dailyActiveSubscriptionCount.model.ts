import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

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
    }
  },
  {
    sequelize,
    modelName: "DailyActiveSubscriptionCount"
  }
);

export default DailyActiveSubscriptionCount;