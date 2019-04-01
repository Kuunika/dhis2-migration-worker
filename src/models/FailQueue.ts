import {
  DefineOptions,
  DefineModelAttributes,
  Sequelize,
  STRING,
  BOOLEAN,
  BIGINT
} from 'sequelize';
const tableName = 'failqueue';

const fields: DefineModelAttributes<object> = {
  organizationUnitCode: STRING,
  dataElementId: BIGINT(11),
  migrationId: BIGINT(11),
  value: BIGINT(11),
  isProcessed: BOOLEAN,
  isMigrated: BOOLEAN,
  period: STRING,
  attempts: BIGINT(11),
  migratedAt: STRING,
};

const options: DefineOptions<object> = {
  freezeTableName: true,
  tableName,
  timestamps: false,
};

export const createFailQueueModel = async (
  sequelize: Sequelize
): Promise<any> => await sequelize.define(tableName, fields, options);
