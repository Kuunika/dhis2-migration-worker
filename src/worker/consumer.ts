import Worker = require('tortoise');
import { Sequelize } from 'sequelize';

import { consume, createWorker, Message } from './helpers';
import { migrate } from '../migrate';

export const startWorker = async (
  connection: Sequelize,
  host: string,
  queueName: string,
  chunkSize: number
): Promise<void> => {
  const worker: Worker = await createWorker(host);

  const callback = async (message: string, ack: () => void) => {
    try {
      const parsedMessage: Message = await JSON.parse(message);

      await migrate(
        connection,
        worker,
        parsedMessage,
        chunkSize
      );
    } catch (error) {
      console.log(error.message);
    }

    ack();
  };

  await consume(worker, queueName, callback);
};
