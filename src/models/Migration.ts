import {
  ModelOptions,
  ModelAttributes,
  Sequelize,
  BIGINT,
  DATE
} from 'sequelize';

const tableName = 'Migration';

const fields: ModelAttributes = {
  uploadedAt: DATE,
  structureValidatedAt: DATE,
  structureFailedValidationAt: DATE,
  elementsAuthorizationAt: DATE,
  elementsFailedAuthorizationAt: DATE,
  valuesValidatedAt: DATE,
  valuesFailedValidationAt: DATE,
  reportDispatchedAt: DATE,
  totalMigratedElements: BIGINT,
  totalDataElements: BIGINT,
  totalFailedElements: BIGINT,
  migrationCompletedAt: DATE,
  clientId: BIGINT,
  createdAt: DATE,
};

const options: ModelOptions = {
  freezeTableName: true,
  tableName,
  timestamps: false,
};

export const createMigrationModel = async (
  sequelize: Sequelize
): Promise<any> => await sequelize.define(tableName, fields, options);
