import Worker = require('tortoise');
const env = process.env;

export interface Message {
  channelId: string;
  client: string;
  email?: string;
  migrationId: number;
  source?: string;
  description: string;
  migrationFailed?: boolean;
  attempts?: number;
  message?: string;
  service?: string;
}

/**
 * Create worker instance.
 *
 * @param { string } host - RabbitMQ host
 */
export const createWorker = async (host: string): Promise<Worker> => {
  const options: object = {
    connectRetries: env.DFQW_QUEUE_CONNECT_RETRIES || 2,
    connectRetryInterval: env.DFQW_QUEUE_CONNECT_RETRY_INTERVAL || 100,
  };

  return await new Worker(host, options);
};

/**
 * Connect to queue
 *
 * @param { Worker } worker - Worker instance.
 * @param { sting } queueName - Queue name.
 * @param { function } processMessage - Function
 */
export const consume = async (
  worker: Worker,
  queueName: string,
  // tslint:disable-next-line: ban-types
  callback: (message: string, ack: () => void) => Promise<void>
): Promise<void> => {
  const options: object = { durable: env.DFQW_QUEUE_DURABLE || true };

  await worker
    .queue(queueName, options)
    .prefetch(1)
    .subscribe(callback);
};

export const pushToFailQueue = async (
  worker: Worker,
  message: Message
): Promise<void> => {
  const queueName = env.DFQW_QUEUE_NAME || 'DHIS2_INTEGRATION_FAIL_QUEUE';

  message.attempts = 1;

  await publishMessage(worker, queueName, message);
};

export const pushToEmailQueue = async (
  worker: Worker,
  message: Message
): Promise<void> => {
  const queueName =
    env.DFQW_EMAIL_QUEUE_NAME || 'DHIS2_EMAIL_INTEGRATION_QUEUE';

  message.migrationFailed = false;
  message.source = 'migration';

  await publishMessage(worker, queueName, message);
};

export const pushToLogWorker = async (
  worker: Worker,
  message: Message
): Promise<void> => {
  const queueName = env.MW_ADX_LOG_WORKER || 'ADX_LOG_WORKER';
  await publishMessage(worker, queueName, message);
};

const publishMessage = async (
  worker: Worker,
  queueName: string,
  message: Message
): Promise<void> => {
  console.log(message);
  const options: object = { durable: env.DFQW_QUEUE_DURABLE || true };
  await worker.queue(queueName, options).publish(message);
};
