import axios from 'axios';

import { Auth, getAuth, getURL } from './config';
import { DHIS2DataElement } from './helper';

const log = console.log;

const calculatedImportSize = (dhis2Response: any) => {
  const { updated, imported, ignored } = dhis2Response.data.importCount;
  console.log(`Updated ${updated}, Imported ${imported}, Ignored ${ignored}`);
  return (Number(updated) + Number(imported) + Number(ignored));
}

export const isDHISMigrationSuccessful = (
  dhis2Response: any,
  payloadSize: number
): boolean => {
  if (dhis2Response) {
    if (payloadSize === calculatedImportSize(dhis2Response)) {
      return true;
    }
  }
  return false;
};

export const sendDhis2Payload = async (
  dhis2DataElements: DHIS2DataElement[]
): Promise<any> => {
  const auth: Auth = await getAuth();
  const url = `${await getURL()}/dataValueSets`;

  const options: object = {
    auth,
    data: { dataValues: dhis2DataElements },
    method: 'POST',
    url,
  };

  return await axios(options).catch((err: Error) => log(err.message));
};
