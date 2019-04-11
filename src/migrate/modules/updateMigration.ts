import { createMigrationModel } from '../../models';
import { Sequelize } from 'sequelize';
import { handleError } from '.';

export const updateMigration = async (
  connection: Sequelize,
  migrationId: number,
  migrationDataElementsFailed: number[],
  migrationDataElementsSuccess: number[]
): Promise<void> => {
  const Migration = await createMigrationModel(connection).catch(handleError);

  const where = { id: migrationId };

  const update = {
    totalMigratedElements: migrationDataElementsSuccess.length,
    totalFailedElements: migrationDataElementsFailed.length,
  };

  await Migration.update(update, { where }).catch(handleError);
};
