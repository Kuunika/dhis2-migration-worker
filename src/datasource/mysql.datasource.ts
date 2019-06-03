import { Sequelize, Options, PoolOptions } from 'sequelize';

const pool: PoolOptions = {
  max: 5,
  min: 0,
  acquire: 30000,
  idle: 10000,
};

/**
 * Connect to a database
 *
 * @param { string } host - Database host name.
 * @param { string } database - Database name.
 * @param { string } username - Database user name.
 * @param { string } password - Database user password.
 *
 * @return { Sequelize } The x value.
 */
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
  await checkConnectionStatus(connection);

  return connection;
};

const checkConnectionStatus = async (connection: Sequelize): Promise<void> => {
  await connection
    .authenticate()
    .then(() => console.log('connection established successfully to database'))
    .catch(err => console.log(err.message));
};
