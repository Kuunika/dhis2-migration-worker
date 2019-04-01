import Worker = require('tortoise');
import { Sequelize } from 'sequelize';

import { consume, createWorker, Message } from './helpers';
import { migrate } from '../migrate';

export const startWorker = async (
  sequelize: Sequelize,
  host: string,
  queueName: string,
  chunkSize: number
): Promise<void> => {
  const worker: Worker = await createWorker(host);

  const callback = async (message: string, ack: () => void) => {
    try {
      // TODO: format the message
      const parsedMessage: Message = await JSON.parse(message);

      // TODO: migrate data
      const hasMigrated = await migrate(
        sequelize,
        worker,
        parsedMessage,
        chunkSize
      );

      console.log(hasMigrated);
    } catch (error) {
      console.log(error.message);
    }

    ack();
  };

  await consume(worker, queueName, callback);
};
