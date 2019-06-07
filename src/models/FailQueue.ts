
import {
  ModelOptions,
  ModelAttributes,
  Sequelize,
  BIGINT,
  DATE
} from 'sequelize';
const tableName = 'Failqueue';

const fields: ModelAttributes = {
  migrationId: BIGINT,
  productId: BIGINT,
  attempts: BIGINT,
  createdAt: DATE,
};

const options: ModelOptions = {
  freezeTableName: true,
  tableName,
  timestamps: false,
};

export const createFailQueueModel = async (
  sequelize: Sequelize
): Promise<any> => await sequelize.define(tableName, fields, options);
