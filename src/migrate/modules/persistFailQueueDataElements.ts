import { Sequelize } from 'sequelize';

import {
  createMigrationDataElementsModel,
  createFailQueueModel
} from '../../models';

import { handleError } from '.';

export const persistFailQueueDataElements = async (
  connection: Sequelize,
  ids: number[]
): Promise<void> => {
  const MigrationDataElement = await createMigrationDataElementsModel(
    connection
  );
  const FailQueue = await createFailQueueModel(connection);

  for (const id of ids) {
    const migrationDataElement = await MigrationDataElement.findByPk(id).catch(
      handleError
    );

    if (migrationDataElement) {
      await FailQueue.create({
        migrationId: migrationDataElement.dataValues.migrationId,
        dataElementCode: migrationDataElement.dataValues.dataElementCode,
        attempts: 1,
        createdAt: new Date(Date.now()),
      }).catch(handleError);
    } else {
      console.log('Migration Data Element not available');
    }
  }
};
