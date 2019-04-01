import {
  DefineOptions,
  DefineModelAttributes,
  Sequelize,
  STRING,
  BIGINT
} from 'sequelize';

const tableName = 'dataelement';

const fields: DefineModelAttributes<object> = {
  dataSetId: BIGINT(11),
  dataElementId: STRING,
  dataElementName: STRING,
};

const options: DefineOptions<object> = {
  freezeTableName: true,
  tableName,
  timestamps: false,
};

export const createDataElementModel = async (
  sequelize: Sequelize
): Promise<any> => await sequelize.define(tableName, fields, options);
