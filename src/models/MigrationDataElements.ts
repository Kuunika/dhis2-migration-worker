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
  organizationUnitCode: STRING,
  dataElementId: BIGINT(11),
  migrationId: BIGINT(11),
  value: BIGINT(11),
  isValueValid: BOOLEAN,
  isElementAuthorized: BOOLEAN,
  isProcessed: BOOLEAN,
  isMigrated: BOOLEAN,
  period: STRING,
};

const options: DefineOptions<object> = {
  freezeTableName: true,
  tableName,
  timestamps: false,
};

export const createMigrationDataElements = async (
  sequelize: Sequelize
): Promise<any> => await sequelize.define(tableName, fields, options);
