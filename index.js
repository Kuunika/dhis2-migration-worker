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
  getDataElementModel
} = require("./models");

const chi = msg => console.log(` [x] Received ${msg.content.toString()}`);

const options = {
  noAck: false
};

const handleQueueConnection = async (err, conn) => {
  if (err) console.log(err);

  const spinner = ora();
  const sequelize = await require("./database")(spinner);

  const Migration = await getMigrationModel(sequelize);
  const Client = await getClientModel(sequelize);
  const DataSet = await getDataSetModel(sequelize);
  const MigrationDataElements = await getMigrationDataElementsModel(sequelize);
  const DataElement = await getDataElementModel(sequelize);

  const handleChannel = async (err, ch) => {
    const q = process.env.MW_QUEUE_NAME || "INTERGRATION_MEDIATOR";

    ch.assertQueue(q, {
      durable: true
    });

    spinner.succeed(`[*] Waiting for messages in ${q}. To exit press CTRL+C`);
    ch.consume(
      q,
      async function (msg) {
        try {
          console.log(" [x] Received %s", msg.content.toString());

          //acknowlegde on migration finished
          const acknowlegdementEmitter = new EventEmitter();
          acknowlegdementEmitter.on('$migrationDone', () => {
            ch.ack(msg);
          });

          const { migrationId = null } = JSON.parse(msg.content.toString());

          let isMigrating = true;

          while (isMigrating) {
            const migration = await Migration.findByPk(migrationId);
            if (migration) {
              const client = await Client.findByPk(migration.dataValues.clientId);
              if (client) {
                const dataSet = await DataSet.findOne({
                  clientId: client.id
                });
                if (dataSet) {
                  const migrationDataElements = await MigrationDataElements.findAll(
                    {
                      where: {
                        migrationId: migration.dataValues.id,
                        isMigrated: false
                      }
                    }
                  );
                  if (migrationDataElements) {

                    //reporting purposes
                    await Migration.update(
                      { totalDataElements: migrationDataElements.length },
                      { where: { id: migrationId } }
                    );

                    const data = [];

                    for (const m of migrationDataElements) {
                      const dataElement = await DataElement.findByPk(
                        m.dataValues.dataElementId
                      );
                      if (dataElement) {
                        await data.push({
                          dataElement: dataElement.dataValues.dataElementId,
                          value: m.dataValues.value,
                          orgUnit: m.dataValues.organizationUnitCode,
                          period: m.dataValues.period,
                          id: m.dataValues.id
                        });
                      }
                    }
                    const dataChunks = _.chunk(data, process.env.MW_DATA_CHUNK_SIZE || 200);

                    for (const dataChunk of dataChunks) {
                      const request = await axios({
                        url: `${process.env.MW_DHIS2_URL}/dataValueSets`,
                        method: 'POST',
                        data: {
                          dataValues: dataChunk
                        },
                        auth: {
                          username: process.env.MW_DHIS2_USERNAME,
                          password: process.env.MW_DHIS2_PASSWORD
                        }
                      })

                      //reporting purposes
                      await Migration.update(
                        { totalMigratedElements: data.length, totalFailedElements: 0 },
                        { where: { id: migrationId } }
                      );

                      //mark the migrationdataelement as migrated
                      await MigrationDataElements.update(
                        { isMigrated: true },
                        { where: { id: dataChunk.map(dc => dc.id) } }
                      );
                      console.log(request.data.importCount);
                    }
                    //reporting purposes
                    await Migration.update(
                      {
                        isMigrated: true, migrationCompletedAt: moment(new Date()).format('YYYY-MM-DD HH:mm:ss')
                      },
                      { where: { id: migrationId } }
                    );
                    await acknowlegdementEmitter.emit('$migrationDone');
                    isMigrating = false;
                  }
                }
              }
            }
          }
        } catch (err) {
          spinner.warn(`Error: ${err.message}`);
        }
      },
      options
    );
  };
  await conn.createChannel(handleChannel);
  spinner.stop();
};

require("dotenv").config();

const host = process.env.MW_QUEUE_HOST || "amqp://localhost";
amqp.connect(
  host,
  handleQueueConnection
);
