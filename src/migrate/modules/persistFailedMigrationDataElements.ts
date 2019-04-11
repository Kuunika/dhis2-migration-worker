import { Sequelize } from 'sequelize';

import { handleError } from '.';
import { createMigrationDataElementsModel } from '../../models';

export const persistFailedMigrationDataElements = async (
  connection: Sequelize,
  ids: number[],
  update: object
): Promise<void> => {
  const MigrationDataElement = await createMigrationDataElementsModel(
    connection
  );
  await MigrationDataElement.update(update, { where: { id: ids } }).catch(
    handleError
  );
};
