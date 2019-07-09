import { createMigrationModel } from '../../models';
import { Sequelize } from 'sequelize';
import { handleError } from '.';

export const updateMigrationCompletedAt = async (
  connection: Sequelize,
  migrationId: number
): Promise<void> => {
  const Migration = await createMigrationModel(connection).catch(handleError);

  const where = { id: migrationId };

  const update = {
    migrationCompletedAt: new Date(Date.now()),
  };

  await Migration.update(update, { where }).catch(handleError);
};
