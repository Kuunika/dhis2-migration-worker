const amqp = require("amqplib/callback_api");
const ora = require("ora");
const axios = require("axios");
const _ = require('lodash');
const EventEmitter = require('events');
const _Sequelize = require('sequelize');
const moment = require('moment');

const {
  getClientModel,
  getMigrationModel,
  getDataSetModel,
  getMigrationDataElementsModel,
  getDataElementModel,
  getFailQueueModel
} = require("./models");

const chi = msg => console.log(` [x] Received ${msg.content.toString()}`);

const options = {
  noAck: false
};

const sendEmail = (
  migrationId,
  email,
  flag) => {
  const host = process.env.MW_EMAIL_QUEUE_HOST || 'amqp://localhost';

  amqp.connect(
    host,
    function (err, conn) {
      if (err) console.log(err);
      conn.createChannel(function (err, ch) {
        if (err) console.log(err);

        const options = {
          durable: true,
        };

        const queueName =
          process.env.MW_EMAIL_QUEUE_NAME ||
          'DHIS2_EMAIL_INTEGRATION_QUEUE';

        ch.assertQueue(queueName, options);
        const message = JSON.stringify({ migrationId, email, flag });
        ch.sendToQueue(queueName, Buffer.from(message), {
          persistent: true,
        });
        console.log(`[x] Sent ${message}`);
        setTimeout(() => conn.close(), 500);
      });
    },
  );
}

const handleQueueConnection = async (err, conn) => {
  if (err) console.log(err);

  const spinner = ora();
  const sequelize = await require("./database")(spinner);

  const Migration = await getMigrationModel(sequelize);
  const Client = await getClientModel(sequelize);
  const DataSet = await getDataSetModel(sequelize);
  const MigrationDataElements = await getMigrationDataElementsModel(sequelize);
  const DataElement = await getDataElementModel(sequelize);
  const FailQueue = await getFailQueueModel(sequelize);

  const updateOnSucessfullMigration = async (migrationId, count) => {
    //update migration model
    const migration = await Migration.findByPk(migrationId);
    const totalMigratedElements = migration.dataValues.totalMigratedElements + count;
    await Migration.update(
      { totalMigratedElements },
      { where: { id: migrationId } }
    );
  }

  const pushToFailureQueue = (
    migrationId
  ) => {
    const host = process.env.MW_FAILURE_QUEUE_HOST || 'amqp://localhost';
    amqp.connect(
      host,
      function (err, conn) {
        if (err) console.log(err);
        conn.createChannel(function (err, ch) {
          if (err) console.log(err);
          const options = {
            durable: true,
          };

          const queueName =
            process.env.MW_FAILURE_QUEUE_NAME ||
            'DHIS2_INTEGRATION_FAIL_QUEUE';

          ch.assertQueue(queueName, options);
          const message = JSON.stringify({ migrationId });
          ch.sendToQueue(queueName, Buffer.from(message), {
            persistent: true,
          });
          console.log(`[x] Sent ${message} to failure queue`);
          setTimeout(() => conn.close(), 500);
        });
      },
    );
  }

  const handleChannel = async (err, ch) => {
    const q = process.env.MW_QUEUE_NAME || "INTERGRATION_MEDIATOR";

    ch.assertQueue(q, {
      durable: true
    });

    spinner.succeed(`[*] Waiting for messages in ${q}. To exit press CTRL+C`);
    ch.consume(
      q,
      async function (msg) {
        const { migrationId = null } = JSON.parse(msg.content.toString());

        //acknowlegde on migration finished
        const acknowlegdementEmitter = new EventEmitter();
        acknowlegdementEmitter.on('$migrationDone', () => {
          ch.ack(msg);
        });

        let failureOccured = false;
        let isMigrating = true;
        let offset = 0;
        const limit = Number(process.env.MW_DATA_CHUNK_SIZE || 5);

        while (isMigrating) {
          const where = { migrationId, isMigrated: false }
          const migrationDataElements = await MigrationDataElements.findAll(
            { where, limit, offset }
          ).catch(err => console.log(err.message));

          if (migrationDataElements.length != 0) {
            //pagination increment
            offset += limit;

            const dataValues = [];
            for (const migrationDataElement of migrationDataElements) {
              const dataElement = await DataElement.findByPk(
                migrationDataElement.dataValues.dataElementId
              ).catch(err => console.log(err.message));
              if (dataElement) {
                await dataValues.push({
                  dataElement: dataElement.dataValues.dataElementId,
                  value: migrationDataElement.dataValues.value,
                  orgUnit: migrationDataElement.dataValues.organizationUnitCode,
                  period: migrationDataElement.dataValues.period,
                  id: migrationDataElement.dataValues.id
                });
              }
            }

            const response = await axios({
              url: `${process.env.MW_DHIS2_URL}/dataValueSet`,
              method: 'POST',
              data: {
                dataValues
              },
              auth: {
                username: process.env.MW_DHIS2_USERNAME,
                password: process.env.MW_DHIS2_PASSWORD
              }
            }).catch(err => console.log(err.message));

            if (response) {
              await updateOnSucessfullMigration(migrationId, dataValues.length);
              const ids = migrationDataElements.map(mde => mde.dataValues.id);
              //migration done alright
              //TODO:   update on real id's
              await MigrationDataElements.update(
                { isMigrated: true },
                { where: { id: 0 } }
              );
            } else {
              //the failure queue must be ingaged
              failureOccured = true;
              const failedDataElements = migrationDataElements.map(mde => ({
                dataElementId: mde.dataValues.dataElementId,
                value: mde.dataValues.value,
                organizationUnitCode: mde.dataValues.organizationUnitCode,
                period: mde.dataValues.period,
                migrationId: mde.dataValues.migrationId,
                attempts: 1
              }));
              await FailQueue.bulkCreate(failedDataElements);
            }
          } else {
            isMigrating = false
            await console.log('migration done')
          }
        }
        // acknowlegdementEmitter.emit('$migrationDone');
        if (failureOccured) {
          await pushToFailureQueue(migrationId);
        }
        //TODO: producer code for the failed queue
      },
      options
    );
  };
  await conn.createChannel(handleChannel);
  spinner.stop();
};

{
  mid,
  email,
  client,
  flag
}

require("dotenv").config();

const host = process.env.MW_QUEUE_HOST || "amqp://localhost";
amqp.connect(
  host,
  handleQueueConnection
);
