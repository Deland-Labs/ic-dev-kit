#!/usr/bin/env node
import logger from "node-color-log";
import * as canister from "../src/canister";

export const execute_task_build_all = async () => {
  canister.build_all();

  logger.info("execute_task_build_all done");
};
