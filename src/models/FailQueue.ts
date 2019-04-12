import {
  DefineOptions,
  DefineModelAttributes,
  Sequelize,
  BIGINT,
  DATE
} from 'sequelize';
const tableName = 'failqueue';

const fields: DefineModelAttributes<object> = {
  migrationId: BIGINT(11),
  productId: BIGINT(11),
  attempts: BIGINT(11),
  createdAt: DATE,
};

const options: DefineOptions<object> = {
  freezeTableName: true,
  tableName,
  timestamps: false,
};

export const createFailQueueModel = async (
  sequelize: Sequelize
): Promise<any> => await sequelize.define(tableName, fields, options);
