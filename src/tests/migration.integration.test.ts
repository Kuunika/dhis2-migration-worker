import { join } from 'path';
import { Sequelize } from 'sequelize';
import { DotenvParseOutput } from 'dotenv';
import Worker = require('tortoise');

import * as iconv from 'iconv-lite';
iconv.encodingExists('foo');

import { migration, migrationDataElements, modes, fakeDhis2Server } from './fixtures';
import { loadConfig } from '../config';
import { connectToDatabase } from '../datasource';
import { createMigrationModel, createMigrationDataElementsModel } from '../models';
import { createWorker, Message } from '../worker/helpers';
import { migrate } from '../migrate/migrate';

let config: DotenvParseOutput;
let connection: Sequelize;
let testMigration: any;
let worker: Worker;
let server: any;
let message: Message;
let chunkSize: number;

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

    message = {
      channelId: 'asdhedas',
      client: 'test client',
      migrationId: testMigration.dataValues.id,
      description: 'test description',
    };

    const MigrationDataElement = await createMigrationDataElementsModel(
      connection
    );
    await MigrationDataElement.destroy({ truncate: true });
    await MigrationDataElement.create(migrationDataElements);

    const host = config.MW_QUEUE_HOST;
    worker = await createWorker(host);
    chunkSize = Number(config.MW_DATA_CHUNK_SIZE);
  });

  afterEach(async () => {
    await connection.close();
    await worker.destroy();
    await server.close();
  });

  it('should send data successfully to dhis2', async () => {
    server = await fakeDhis2Server(3000, modes.succeed);
    const flag = await migrate(connection, worker, message, chunkSize);
    expect(flag).toBe(false);
  });

  it('should fail to send data successfully to dhis2', async () => {
    server = await fakeDhis2Server(3000, modes.fail);
    const flag = await migrate(connection, worker, message, chunkSize);
    expect(flag).toBe(true);
  });

});
