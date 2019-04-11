import { Sequelize } from 'sequelize';
import { Message, pushToEmailQueue, pushToFailQueue } from '../worker';
import Worker = require('tortoise');
import { isDHISMigrationSuccessful, sendDhis2Payload } from '../query';

import { PusherLogger } from '../Logger';
import { createChunkCounter } from './modules';

import {
  getMigrationDataElements,
  generateDHIS2Payload,
  updateMigrationDataElements,
  persistFailQueueDataElements
} from './helpers';

let hasMigrationFailed = false;

export const migrate = async (
  sequelize: Sequelize,
  worker: Worker,
  message: Message,
  chunkSize: number
): Promise<boolean> => {
  const { migrationId = 0, channelId } = message;

  const pusherLogger = await new PusherLogger(channelId);

  const chunkCounter = await createChunkCounter(
    sequelize,
    migrationId,
    chunkSize
  );

  let offset = 0;
  let migrationDataElementFailedMigrationIds: number[] = [0];
  let migrationDataElementSuccessfulMigrationIds: number[] = [0];

  for (const _counter of chunkCounter) {
    const migrationDataElements = await getMigrationDataElements(
      sequelize,
      migrationId,
      offset,
      chunkSize
    );

    await pusherLogger.info(`chunk ${offset + 1} of ${chunkCounter.length}`);

    const [
      dhis2DataElements,
      migrationDataElementsIds,
    ] = await generateDHIS2Payload(sequelize, migrationDataElements);

    const dhis2Response = await sendDhis2Payload(dhis2DataElements);

    const wasDHIS2MigrationSuccessful = isDHISMigrationSuccessful(
      dhis2Response,
      dhis2DataElements.length
    );

    if (wasDHIS2MigrationSuccessful) {
      migrationDataElementSuccessfulMigrationIds = migrationDataElementSuccessfulMigrationIds.concat(
        migrationDataElementsIds
      );
    } else {
      migrationDataElementFailedMigrationIds = migrationDataElementFailedMigrationIds.concat(
        migrationDataElementsIds
      );
      hasMigrationFailed = true;
    }

    offset++;
  }

  if (hasMigrationFailed) {
    await persistFailQueueDataElements(
      sequelize,
      migrationDataElementFailedMigrationIds.slice(1)
    );

    await pushToFailQueue(worker, message);
  } else {
    await updateMigrationDataElements(
      sequelize,
      migrationDataElementSuccessfulMigrationIds,
      { isProcessed: true, migratedAt: new Date(Date.now()) }
    );
    await pushToEmailQueue(worker, message);
  }

  migrationDataElementFailedMigrationIds = [0];
  migrationDataElementSuccessfulMigrationIds = [0];

  return hasMigrationFailed;
};
