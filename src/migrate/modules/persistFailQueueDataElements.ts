import { Sequelize } from 'sequelize';

import {
  createMigrationDataElementsModel,
  createFailQueueModel
} from '../../models';

import { handleError } from '.';

export const persistFailQueueDataElements = async (
  sequelize: Sequelize,
  ids: number[]
): Promise<void> => {
  const MigrationDataElement = await createMigrationDataElementsModel(
    sequelize
  );
  const FailQueue = await createFailQueueModel(sequelize);

  for (const id of ids) {
    const migrationDataElement = await MigrationDataElement.findByPk(id).catch(
      handleError
    );

    if (migrationDataElement) {
      await FailQueue.create({
        migrationId: migrationDataElement.dataValues.migrationId,
        productId: migrationDataElement.dataValues.productId,
        attempts: 1,
      });
    } else {
      console.log('Migration Data Element not available');
    }
  }
};
