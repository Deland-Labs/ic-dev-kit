import logger from "node-color-log";
import { identityFactory } from "../src/identity";
import { ICShowPrincipalInput } from "../src/types";

export const execute_task_show_principal = (input: ICShowPrincipalInput) => {
  identityFactory.printIdentity(input);
  logger.info("execute_task_show_principal done");
};
