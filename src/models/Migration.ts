const Sequelize = require('sequelize');

const tableName = 'migration';

const fields = {
  uploadedAt: Sequelize.STRING,
  structureValidatedAt: Sequelize.STRING,
  structureFailedValidationAt: Sequelize.STRING,
  elementsAuthorizationAt: Sequelize.STRING,
  elementsFailedAuthorizationAt: Sequelize.STRING,
  valuesValidatedAt: Sequelize.STRING,
  valuesFailedValidationAt: Sequelize.STRING,
  reportDispatchedAt: Sequelize.STRING,
  totalMigratedElements: Sequelize.BIGINT(11),
  totalDataElements: Sequelize.BIGINT(11),
  totalFailedElements: Sequelize.BIGINT(11),
  migrationCompletedAt: Sequelize.STRING,
  clientId: Sequelize.BIGINT(11),
};

const options = {
  freezeTableName: true,
  tableName,
  timestamps: false,
};

module.exports = sequelize => sequelize.define(tableName, fields, options);
