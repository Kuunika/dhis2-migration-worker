import { Sequelize } from "sequelize";

import { handleError } from ".";
import { createMigrationDataElementsModel } from "../../models";

export const persistSuccessfulMigrationDataElements = async (
  sequelize: Sequelize,
  ids: number[],
  update: object
): Promise<void> => {
  const MigrationDataElement = await createMigrationDataElementsModel(
    sequelize
  );
  await MigrationDataElement.update(update, { where: { id: ids } }).catch(
    handleError
  );
};
