import { config } from 'dotenv';
import { existsSync } from 'fs';
import { CheckConfigFile, LoadConfig, Path } from './types';
import { FileNotFound } from './error';
import { DotenvParseOutputExtended } from './interface';
/**
 * Load environment variables
 *
 * @param { string } path - Environment variable path.
 * @returns { DotenvParseOutput } - environment variables
 */
export const loadConfig: LoadConfig = async (
  path: Path
): Promise<DotenvParseOutputExtended> => {
  checkConfigFile(path);

  const { error, parsed } = await config({ path });
  if (error) {
    throw new Error(error.message);
  }

  return parsed;
};

const checkConfigFile: CheckConfigFile = (path: Path): void => {
  if (!existsSync(path)) {
    throw new FileNotFound('File Not Found');
    process.exit(1);
  }
};
