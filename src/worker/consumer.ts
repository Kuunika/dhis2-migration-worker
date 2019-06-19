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

  console.log('ready to recieve messages');
  console.log();

  const callback = async (message: string, ack: () => void) => {
    try {
      const parsedMessage: Message = await JSON.parse(message);

      console.log('receive message: ');
      console.log(parsedMessage);
      console.log("hahaha");

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
