import { Sequelize } from 'sequelize';

import {
  createMigrationDataElements,
  createProductsModel,
  createFailQueueModel
} from '../models';

import { DHIS2DataElement } from './interfaces';

export const createChunkCounter = async (
  sequelize: Sequelize,
  migrationId: number,
  chunkSize: number
): Promise<number[]> => {
  const MigrationDataElement = await createMigrationDataElements(sequelize);
  const where = { migrationId, isProcessed: false };

  const migrationDataElementsCount = await MigrationDataElement.count({
    where,
  }).catch(handleError);

  const arraySize = Math.ceil(migrationDataElementsCount / chunkSize);
  return new Array(arraySize);
};

export const getMigrationDataElements = async (
  sequelize: Sequelize,
  migrationId: number,
  offset: number,
  chunkSize: number
) => {
  const MigrationDataElement = await createMigrationDataElements(sequelize);

  const where = { migrationId, isProcessed: false };
  const migrationDataElements = await MigrationDataElement.findAll({
    where,
    limit: chunkSize,
    offset: offset * chunkSize,
  }).catch(handleError);

  return migrationDataElements;
};

export const generateDHIS2Payload = async (
  sequelize: Sequelize,
  migrationDataElements: any
): Promise<[DHIS2DataElement[], number[]]> => {
  const dhis2DataElements: DHIS2DataElement[] = [];
  const migrationDataElementsIds: number[] = [];

  for (const migrationDataElement of migrationDataElements) {
    const { dataValues } = migrationDataElement;

    const {
      id,
      value,
      dataElementCode,
      organizationUnitCode,
      reportingPeriod,
    } = dataValues;

    await migrationDataElementsIds.push(id);

    await dhis2DataElements.push({
      dataElement: dataElementCode,
      orgUnit: organizationUnitCode,
      period: reportingPeriod,
      value,
    });
  }

  return [dhis2DataElements, migrationDataElementsIds];
};

export const handleError = (error: Error) => console.log(error.message);

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
  const MigrationDataElement = await createMigrationDataElements(sequelize);
  await MigrationDataElement.update(update, { where: { id: ids } });
};

export const persistFailQueueDataElements = async (
  sequelize: Sequelize,
  ids: number[]
): Promise<void> => {
  const MigrationDataElement = await createMigrationDataElements(sequelize);
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
