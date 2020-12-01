import {
  ModelOptions,
  ModelAttributes,
  Sequelize,
  STRING,
  BOOLEAN,
  BIGINT,
  DATE
} from 'sequelize';

const tableName = 'Migrationdataelements';

const fields: ModelAttributes = {
  migrationId: BIGINT,
  facilityId: STRING,
  value: BIGINT,
  dataElementCode: STRING,
  organizationUnitCode: STRING,
  isProcessed: BOOLEAN,
  migratedAt: DATE,
  reportingPeriod: STRING,
  createdAt: DATE,
};

const options: ModelOptions = {
  freezeTableName: true,
  tableName,
  timestamps: false,
};

export const createMigrationDataElementsModel = async (
  sequelize: Sequelize
): Promise<any> => await sequelize.define(tableName, fields, options);
