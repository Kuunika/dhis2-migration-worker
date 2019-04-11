import { createMigrationDataElementsModel } from '../../models';
import { Sequelize } from 'sequelize';
import { handleError } from '.';

export const getMigrationDataElements = async (
  connection: Sequelize,
  migrationId: number,
  offset: number,
  chunkSize: number
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
    where,
    limit: chunkSize,
    offset: offset * chunkSize,
  }).catch(handleError);

  return migrationDataElements;
};
