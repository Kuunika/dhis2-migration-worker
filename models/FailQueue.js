const Sequelize = require("sequelize");

const tableName = 'failqueue'

const fields = {
  organizationUnitCode: Sequelize.STRING,
  dataElementId: Sequelize.BIGINT(11),
  migrationId: Sequelize.BIGINT(11),
  value: Sequelize.BIGINT(11),
  isProcessed: Sequelize.BOOLEAN,
  isMigrated: Sequelize.BOOLEAN,
  period: Sequelize.STRING,
  attempts: Sequelize.BIGINT(11),
  migratedAt: Sequelize.STRING
}

const options = {
  freezeTableName: true,
  tableName,
  timestamps: false
}

module.exports = (sequelize) => sequelize.define(tableName, fields, options);
