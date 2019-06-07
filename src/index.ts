import { join } from 'path';
import { loadConfig } from './config';
import { connectToDatabase } from './datasource';
import { startWorker } from './worker';
const path = join(__dirname, '..', '.env');

const main = async (): Promise<void> => {
  try {
    const config = await loadConfig(path);

    const connection = await connectToDatabase(
      config.MW_DATABASE_HOST || 'localhost',
      config.MW_DATABASE,
      config.MW_DATABASE_USERNAME || 'root',
      config.MW_DATABASE_PASSWORD || ''
    );

    await startWorker(
      connection,
      config.MW_QUEUE_HOST || 'amqp://localhost',
      config.MW_QUEUE_NAME || 'INTEGRATION_MEDIATOR',
      Number(config.MW_DATA_CHUNK_SIZE || 1000)
    );
  } catch (e) {
    console.log(e.message);
  }
};

main();
