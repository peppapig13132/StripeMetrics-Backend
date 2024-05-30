import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database";

class ActiveCustomerCount extends Model {}

ActiveCustomerCount.init(
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
    modelName: "ActiveCustomerCount"
  }
);

export default ActiveCustomerCount;