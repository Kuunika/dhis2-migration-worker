import { Sequelize, Options, PoolOptions } from 'sequelize';

const pool: PoolOptions = {
  max: 5,
  min: 0,
  acquire: 30000,
  idle: 10000,
};

export const connectToDatabase = async (
  host: string,
  database: string,
  username: string,
  password: string
): Promise<Sequelize> => {
  const options: Options = {
    host,
    dialect: 'mysql',
    logging: false,
    pool,
  };

  const connection = await new Sequelize(database, username, password, options);
  const isConnected = await checkConnectionStatus(connection);

  if (!isConnected) {
    console.log('Failed to establish connection to the database');
    process.exit();
  }

  return connection;
};

const checkConnectionStatus = async (
  connection: Sequelize
): Promise<boolean> => {
  try {
    const successMessage = 'connection established successfully to database';
    await connection.authenticate().then(() => console.log(successMessage));
    return true;
  } catch (e) {
    console.log(e.message);
    return false;
  }
};
