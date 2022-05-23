#!/usr/bin/env node
import logger from "node-color-log";
import { canister } from "../src";

export const execute_task_build_all = async () => {
    await canister.createAll();
    canister.build_all();

    logger.info("execute_task_build_all done");
}