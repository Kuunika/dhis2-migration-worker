const amqp = require("amqplib/callback_api");
const ora = require("ora");
const axios = require("axios");

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
    const q = process.env.MW_QUEUE_NAME || "DHIS2_INTERGRATION_MEDIATOR";

    ch.assertQueue(q, {
      durable: true
    });

    spinner.succeed(`[*] Waiting for messages in ${q}. To exit press CTRL+C`);
    ch.consume(
      q,
      async function(msg) {
        console.log(" [x] Received %s", msg.content.toString());

        const { migrationId = null } = JSON.parse(msg.content.toString());

        const migration = await Migration.findById(migrationId);
        if (migration) {
          const client = await Client.findById(migration.dataValues.clientId);
          if (client) {
            const dataSet = await DataSet.findOne({
              clientId: client.id
            });
            if (dataSet) {
              const migrationDataElements = await MigrationDataElements.findAll(
                {
                  where: {
                    migrationId: migration.dataValues.id
                  }
                }
              );
              if (migrationDataElements) {
                const data = [];

                for (const m of migrationDataElements) {
                  const dataElement = await DataElement.findById(
                    m.dataValues.dataElementId
                  );
                  // channel event
                  if (dataElement) {
                    await data.push({
                      dataElement: dataElement.dataValues.dataElementId,
                      value: m.dataValues.value,
                      orgUnit: m.dataValues.organizationUnitCode,
                      period: m.dataValues.period
                    });
                  }
                }
                const req = await axios({
                  url:
                    "http://dhistest.kuunika.org:1414/dhis/api/dataValueSets",
                  method: "POST",
                  data: {
                    dataValues: data
                  },
                  auth: {
                    username: "haroontwalibu",
                    password: "Mamelodi@19"
                  }
                }).catch(error => console.log(error));

                await console.log(req.data.importCount);
              }
            }
          }
        }

        await setTimeout(function() {
          console.log(" [x] Done");
          ch.ack(msg);
        }, 1000);
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
