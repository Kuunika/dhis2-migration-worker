const Sequelize = require("sequelize");

const tableName = 'migrationdataelements'

const fields = {
  organizationUnitCode: Sequelize.STRING,
  dataElementId: Sequelize.BIGINT(11),
  migrationId: Sequelize.BIGINT(11),
  value: Sequelize.BIGINT(11),
  isValueValid: Sequelize.BOOLEAN,
  isElementAuthorized: Sequelize.BOOLEAN,
  isProcessed: Sequelize.BOOLEAN,
  isMigrated: Sequelize.BOOLEAN,
  period: Sequelize.STRING,
}

const options = {
  freezeTableName: true,
  tableName,
  timestamps: false
}

module.exports = (sequelize) => sequelize.define(tableName, fields, options);
