const Sequelize = require("sequelize");

const tableName = 'dataset'

const fields = {
  clientId: Sequelize.BIGINT(11),
  description: Sequelize.STRING,
  categoryCombo: Sequelize.STRING,
  dhis2Id: Sequelize.STRING
}

const options = {
  freezeTableName: true,
  tableName,
  timestamps: false
}

module.exports = (sequelize) => sequelize.define(tableName, fields, options)
