import { createMigrationDataElementsModel } from '../../models';
import { Sequelize } from 'sequelize';
import { handleError } from '.';

export const getTotalMigrationDataElements = async (
  connection: Sequelize,
  migrationId: number
) => {
  const MigrationDataElement = await createMigrationDataElementsModel(
    connection
  ).catch(handleError);

  const where = {
    migrationId,
    migratedAt: null,
    isProcessed: false,
  };

  const migrationDataElements = await MigrationDataElement.findAll({
    where
  }).catch(handleError);

  return migrationDataElements.length;
};