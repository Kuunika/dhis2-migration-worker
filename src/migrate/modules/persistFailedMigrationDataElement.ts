import { Sequelize } from 'sequelize';

import { createMigrationDataElementsModel } from '../../models';

/**
 * Update fail queues
 *
 * @param { Connection } connection - Connection manager instance
 * @param { Where } where - Where clause.
 */
export const updateMigrationDataElements = async (
  sequelize: Sequelize,
  ids: number[],
  update: object
): Promise<void> => {
  const MigrationDataElement = await createMigrationDataElementsModel(
    sequelize
  );
  await MigrationDataElement.update(update, { where: { id: ids } });
};
