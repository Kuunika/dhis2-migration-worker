import { Sequelize } from 'sequelize';
import { Message, pushToEmailQueue, pushToFailQueue, pushToLogWorker } from '../worker';
import Worker = require('tortoise');
import { isDHISMigrationSuccessful, sendDhis2Payload } from '../query';

import {
  createChunkCounter,
  getMigrationDataElements,
  generateDHIS2Payload,
  persistSuccessfulMigrationDataElements,
  persistFailedMigrationDataElements,
  persistFailQueueDataElements,
  updateMigration
} from './modules';

let hasMigrationFailed = false;

export const migrate = async (
  connection: Sequelize,
  worker: Worker,
  message: Message,
  chunkSize: number
): Promise<boolean> => {
  const { migrationId = 0 } = message;

  message.service = 'MIGRATION WORKER';

  const chunkCounter = await createChunkCounter(
    connection,
    migrationId,
    chunkSize
  );

  let offset = 0;
  let migrationDataElementFailedMigrationIds: number[] = [0];
  let migrationDataElementSuccessfulMigrationIds: number[] = [0];

  for (const _counter of chunkCounter) {
    const migrationDataElements = await getMigrationDataElements(
      connection,
      migrationId,
      offset,
      chunkSize
    );

    message.message = `chunk ${offset + 1} of ${chunkCounter.length}`;
    await pushToLogWorker(worker, message);

    const [
      dhis2DataElements,
      migrationDataElementsIds,
    ] = await generateDHIS2Payload(migrationDataElements);

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

  await persistSuccessfulMigrationDataElements(
    connection,
    migrationDataElementSuccessfulMigrationIds,
    { isProcessed: true, migratedAt: new Date(Date.now()) }
  );

  await persistFailedMigrationDataElements(
    connection,
    migrationDataElementFailedMigrationIds,
    { isProcessed: true }
  );

  if (hasMigrationFailed) {
    await persistFailQueueDataElements(
      connection,
      migrationDataElementFailedMigrationIds.slice(1)
    );

    await pushToFailQueue(worker, message);
  } else {
    await pushToEmailQueue(worker, message);
  }

  await updateMigration(
    connection,
    migrationId,
    migrationDataElementFailedMigrationIds.slice(1),
    migrationDataElementSuccessfulMigrationIds.slice(1)
  );

  migrationDataElementFailedMigrationIds = [0];
  migrationDataElementSuccessfulMigrationIds = [0];

  return hasMigrationFailed;
};
