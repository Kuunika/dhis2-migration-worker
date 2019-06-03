import { join } from 'path';
import { Sequelize } from 'sequelize';
import { DotenvParseOutput } from 'dotenv';
import Worker = require('tortoise');

import { loadConfig } from '../config';
import { connectToDatabase } from '../datasource';
import { createMigrationDataElementsModel, createMigrationModel } from '../models';
import { migrationDataElements, migration, fakeDhis2Server, modes } from './fixtures';
import { createWorker, Message } from '../worker/helpers';
import { migrate } from '../migrate';

let config: DotenvParseOutput;
let connection: Sequelize;
let worker: Worker;
let testMigration: any;
let message: Message;
let chunkSize: number;
let server: any;

describe('Migration integration tests', () => {
  beforeEach(async () => {
    const path = join(__dirname, 'fixtures', '.env.test');
    config = await loadConfig(path);

    connection = await connectToDatabase(
      config.MW_DATABASE_HOST,
      config.MW_DATABASE,
      config.MW_DATABASE_USERNAME,
      config.MW_DATABASE_PASSWORD
    );

    const Migration = await createMigrationModel(connection);
    await Migration.destroy({ truncate: true });
    testMigration = await Migration.create(migration);

    const MigrationDataElement = await createMigrationDataElementsModel(
      connection
    );
    await MigrationDataElement.destroy({ truncate: true });
    for (const migrationDataElement of migrationDataElements) {
      await MigrationDataElement.create({
        ...migrationDataElement,
        migrationId: testMigration.dataValues.id,
      });
    }

    const host = config.MW_QUEUE_HOST;
    worker = await createWorker(host);
    chunkSize = Number(config.MW_DATA_CHUNK_SIZE);

    message = {
      channelId: 'asdhedas',
      client: 'test client',
      migrationId: testMigration.dataValues.id,
      description: 'test description',
    };

    console.log(message);
  });

  afterEach(async () => {
    await connection.close();
    await worker.destroy();
    await server.close();
  });

  it('should send data successfully to dhis2', async () => {

    server = await fakeDhis2Server(3000, modes.succeed);
    const flag = await migrate(connection, worker, message, chunkSize);

    const MigrationDataElement = await createMigrationDataElementsModel(
      connection
    );

    const migratedMigrationDataElement = await MigrationDataElement.findAll({
      migrationId: testMigration.dataValues.id,
    }).catch(e => console.log(e.Message));

    console.log();

    expect(migratedMigrationDataElement[0].dataValues.migratedAt).toEqual(migratedMigrationDataElement[1].dataValues.migratedAt);
    expect(migratedMigrationDataElement[0].dataValues.migratedAt).not.toBe(migratedMigrationDataElement[2].dataValues.migratedAt);

    expect(flag).toBe(false);
  }, 500);

  it('should fail to send data successfully to dhis2', async () => {
    server = await fakeDhis2Server(3000, modes.fail);
    const flag = await migrate(connection, worker, message, chunkSize);
    expect(flag).toBe(true);
  }, 500);

});
