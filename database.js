const ora = require("ora");
const Sequelize = require("sequelize");

const {
  red,
  cyan,
  blue
} = require('chalk');

const pool = {
  max: 5,
  min: 0,
  acquire: 30000,
  idle: 10000
}

module.exports = async (spinner) => {

  await spinner.info(blue("database : preparing connection"))

  const host = process.env.MW_DATABASE_HOST || 'localhost'
  const username = process.env.MW_DATABASE_USERNAME || 'root'
  const password = process.env.MW_DATABASE_PASSWORD || 'root'
  const database = process.env.MW_DATABASE

  spinner.succeed(cyan('database : database variables are set'));

  const options = {
    host,
    dialect: "mysql",
    operatorsAliases: false,
    logging: false,
    pool
  }

  const sequelize = new Sequelize(database, username, password, options);

  sequelize
    .authenticate()
    .then(() => {
      spinner.succeed(cyan(`database: connection established successfully to "${database}" database`));
      spinner.stop()
    })
    .catch(err => {
      spinner.fail(`${"database: Unable to connect to the database" + err}`);
      spinner.stop()
      process.exit(1)
    });

  return sequelize
}
