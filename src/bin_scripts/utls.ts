import * as tsfmt from "typescript-formatter";
import logger from "node-color-log";
import { exec } from "shelljs";

export const code_format = (file_path: string) => {
  const result = exec(`npx eslint --fix --ext .ts ${file_path}`, {
    silent: true,
  });
  logger.debug(`code_format : ${result.stderr}`);
};
