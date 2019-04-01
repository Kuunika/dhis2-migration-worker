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
    operatorsAliases: false,
    logging: false,
    pool,
  };

  const sequelize = await new Sequelize(database, username, password, options);
  checkConnectionStatus(sequelize);

  return sequelize;
};

const checkConnectionStatus = (sequelize: Sequelize): void => {
  sequelize
    .authenticate()
    .then(() => console.log('connection established successfully to database'))
    .catch(err => console.log(err.message));
};
