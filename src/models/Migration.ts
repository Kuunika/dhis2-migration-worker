import {
  DefineOptions,
  DefineModelAttributes,
  Sequelize,
  BIGINT,
  DATE
} from 'sequelize';

const tableName = 'Migration';

const fields: DefineModelAttributes<object> = {
  uploadedAt: DATE,
  structureValidatedAt: DATE,
  structureFailedValidationAt: DATE,
  elementsAuthorizationAt: DATE,
  elementsFailedAuthorizationAt: DATE,
  valuesValidatedAt: DATE,
  valuesFailedValidationAt: DATE,
  reportDispatchedAt: DATE,
  totalMigratedElements: BIGINT(1),
  totalDataElements: BIGINT(1),
  totalFailedElements: BIGINT(1),
  migrationCompletedAt: DATE,
  clientId: BIGINT(1),
  createdAt: DATE,
};

const options: DefineOptions<object> = {
  freezeTableName: true,
  tableName,
  timestamps: false,
};

export const createMigrationModel = async (
  sequelize: Sequelize
): Promise<any> => await sequelize.define(tableName, fields, options);
