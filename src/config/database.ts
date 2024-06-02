import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbHost = process.env.DB_HOST;
const dbName = process.env.DB_NAME;
const dbAdmin = process.env.DB_ADMIN;
const dbPassword = process.env.DB_PASSWORD;

const sequelize = new Sequelize(`${dbName}`, `${dbAdmin}`, `${dbPassword}`, {
    host: `${dbHost}`,
    dialect: 'postgres'
});

sequelize.authenticate().then(() => {
    console.log('Database connected to stripe_dashboard');
}).catch((err) => {
    console.log(err);
});

const syncDatabase = async () => {
  if (process.env.DB_SYNC === 'true') {
    try {
      sequelize.sync({ force: true });
      console.log('Models synchronized with database.');
    } catch(error) {
      console.error('Error synchronizing models:', error);
    }
  }
};
  
syncDatabase();

export default sequelize;
