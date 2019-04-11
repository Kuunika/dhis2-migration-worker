import { createMigrationDataElementsModel } from '../../models';
import { Sequelize } from 'sequelize';
import { handleError } from '.';

export const createChunkCounter = async (
  sequelize: Sequelize,
  migrationId: number,
  chunkSize: number
): Promise<number[]> => {
  const MigrationDataElement = await createMigrationDataElementsModel(
    sequelize
  );
  // tslint:disable-next-line: no-null-keyword
  const where = { migrationId, migratedAt: null, isProcessed: false };
  const migrationDataElementsCount = await MigrationDataElement.count({
    where,
  }).catch(handleError);

  const arraySize = Math.ceil(migrationDataElementsCount / chunkSize);
  return new Array(arraySize);
};
