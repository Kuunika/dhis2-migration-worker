const Sequelize = require("sequelize");

const tableName = 'client'

const fields = {
  name: Sequelize.STRING,
}

const options = {
  freezeTableName: true,
  tableName,
  timestamps: false
}

module.exports = (sequelize) => sequelize.define(tableName, fields, options);
