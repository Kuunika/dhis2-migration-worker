import Pusher = require('pusher');

const env = process.env;
export const createPusherInstance = async (): Promise<Pusher> => {
  const pusherOptions = {
    appId: env.MW_PUSHER_APP_ID || '',
    key: env.MW_PUSHER_KEY || '',
    secret: env.MW_PUSHER_SECRET || '',
    cluster: env.MW_PUSHER_CLUSTER || '',
    encrypted: Boolean(env.MW_PUSHER_ENCRYPTED) || true,
  };

  return new Pusher(pusherOptions);
};
