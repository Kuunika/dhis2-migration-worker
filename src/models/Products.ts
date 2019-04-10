import {
  DefineOptions,
  DefineModelAttributes,
  Sequelize,
  STRING
} from 'sequelize';

const tableName = 'Products';

const fields: DefineModelAttributes<object> = {
  productCode: STRING,
  dataElementCode: STRING,
  openLMISCode: STRING,
};

const options: DefineOptions<object> = {
  freezeTableName: true,
  tableName,
  timestamps: false,
};

export const createProductsModel = async (
  sequelize: Sequelize
): Promise<any> => {
  return await sequelize.define(tableName, fields, options);
};
