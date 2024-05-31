import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

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
    }
  },
  {
    sequelize,
    modelName: "DailySum"
  }
);

export default DailySum;