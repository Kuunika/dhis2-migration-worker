import { Logger, createLogger, format, transports } from 'winston';
import Pusher = require('pusher');

export class PusherLogger {
  private pusher: Pusher;
  private logger: Logger;
  private channelId = 'dhis2-integration-channelId';

  constructor(channelId: string) {
    this.channelId = channelId;
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
      defaultMeta: { service: 'DHIS2-integration-mediator' },
      transports: [
        new transports.File({
          filename: `./logs/${this.channelId}-error.log`,
          level: 'error',
        }),
        new transports.File({
          filename: `./logs/${this.channelId}-combined.log`,
        }),
      ],
    });
    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new transports.Console({
          format: format.combine(format.colorize(), format.simple()),
        })
      );
    }
    this.pusher = new Pusher({
      appId: process.env.MW_PUSHER_APP_ID || '',
      key: process.env.MW_PUSHER_KEY || '',
      secret: process.env.MW_PUSHER_SECRET || '',
      cluster: process.env.MW_PUSHER_CLUSTER || '',
      encrypted: Boolean(process.env.MW_PUSHER_ENCRYPTED) || true,
    });
  }

  public async info(message: string): Promise<void> {
    await this.logger.info(message);
    await this.pusher.trigger(this.channelId, 'my-event', message);
  }

  public async error(message: string): Promise<void> {
    await this.logger.error(message);
  }
}
