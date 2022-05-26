import { exec } from "shelljs";
import fs from "fs";
import logger from "node-color-log";
import { identityFactory } from "../src/identity";

export const execute_task_show_principal = () => {
    identityFactory.printIdentity();
    logger.info("execute_task_show_principal done");
}
