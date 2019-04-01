import { DotenvParseOutput } from 'dotenv';

export interface DotenvParseOutputExtended extends DotenvParseOutput {
  MW_DATABASE_USERNAME?: string;
  MW_DATABASE_PASSWORD?: string;
  MW_DATABASE_HOST?: string;
  MW_DATABASE?: string;

  MW_QUEUE_NAME?: string;
  MW_DATA_CHUNK_SIZE?: string;

  MW_DHIS2_URL?: string;
  MW_DHIS2_USERNAME?: string;
  MW_DHIS2_PASSWORD?: string;

  MW_EMAIL_QUEUE_HOST?: string;
  MW_EMAIL_QUEUE_NAME?: string;

  MW_FAILURE_QUEUE_HOST?: string;
  MW_FAILURE_QUEUE_NAME?: string;
}
