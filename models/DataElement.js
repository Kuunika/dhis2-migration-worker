const Sequelize = require("sequelize");

const tableName = 'dataelement'

const fields = {
  dataSetId: Sequelize.BIGINT(11),
  dataElementId: Sequelize.STRING,
  dataElementName: Sequelize.STRING
}

const options = {
  freezeTableName: true,
  tableName,
  timestamps: false
}

module.exports = (sequelize) => sequelize.define(tableName, fields, options);
