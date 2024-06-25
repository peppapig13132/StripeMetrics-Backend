import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const dbHost = process.env.DB_HOST || 'localhost';
const dbName = process.env.DB_NAME || 'stripe_dashboard';
const dbAdmin = process.env.DB_ADMIN || 'root';
const dbPassword = process.env.DB_PASSWORD || '';

const sequelize: Sequelize = new Sequelize(dbName, dbAdmin, dbPassword, {
    host: dbHost,
    dialect: 'mysql'
});

sequelize.authenticate().then(() => {
    console.log('Database connected to stripe_dashboard');
}).catch((err) => {
    console.log(err);
});

const syncDatabase: () => Promise<void> = async () => {
  if (process.env.DB_SYNC === 'true') {
    try {
      sequelize.sync({ force: true });
      console.log('Models synchronized with database.');
    } catch(error) {
      console.error('Model synchronizing failed.', error);
    }
  }
};

syncDatabase();

export default sequelize;
