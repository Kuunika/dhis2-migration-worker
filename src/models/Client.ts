import {
  DefineOptions,
  DefineModelAttributes,
  Sequelize,
  STRING
} from 'sequelize';

const tableName = 'Client';

const fields: DefineModelAttributes<object> = {
  name: STRING,
  email: STRING,
};

const defineOptions: DefineOptions<object> = {
  freezeTableName: true,
  tableName,
  timestamps: false,
};

export const createClient = (sequelize: Sequelize) => {
  const { define } = sequelize;
  define(tableName, fields, defineOptions);
};
