import {
  DefineOptions,
  DefineModelAttributes,
  Sequelize,
  STRING,
  BOOLEAN,
  BIGINT
} from 'sequelize';

const tableName = 'MigrationDataElements';

const fields: DefineModelAttributes<object> = {
  productId: BIGINT(11),
  migrationId: BIGINT(11),
  facilityId: BIGINT(11),
  value: BIGINT(11),
  dataElementCode: STRING,
  organizationUnitCode: STRING,
  isProcessed: BOOLEAN,
  migratedAt: STRING,
  reportingPeriod: STRING,
};

const options: DefineOptions<object> = {
  freezeTableName: true,
  tableName,
  timestamps: false,
};

export const createMigrationDataElements = async (
  sequelize: Sequelize
): Promise<any> => await sequelize.define(tableName, fields, options);