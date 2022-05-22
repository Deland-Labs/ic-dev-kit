#!/usr/bin/env node
import {exec} from "shelljs";
import logger from "node-color-log";
import {get_dfx_json} from "../src/dfxJson";
import fs from "fs";
import {DEFAULT_DECLARATIONS_OUT_DIR, LoadICDevKitConfiguration} from "../src/ICDevKitConfiguration";

(async () => {
    logger.debug("Generating code of canisters client ...");

    const dfxJson = get_dfx_json();
    for (const canister of dfxJson.canisters.keys()) {
        let result = exec(`dfx generate ${canister}`, {silent: true});
        if (result.code !== 0) {
            logger.warn(`error when generating code of canister ${canister}, error: ${result.stderr}`);
        }
    }

    const icDevKitConfiguration = LoadICDevKitConfiguration();
    const outDir = icDevKitConfiguration.canister.declarations_out_dir;
    fs.mkdirSync(outDir, {recursive: true});

    // remove ./src/declarations/*/index.js
    await exec(`rm -rf ./src/declarations/*/index.js`);
    // copy files from ./src/declarations/* to outDir
    await exec(`cp -r ./src/declarations/* ${outDir}`);

    if (outDir !== DEFAULT_DECLARATIONS_OUT_DIR) {
        // remove ./src/declarations/*
        await exec(`rm -rf ./src/declarations/*`);
    }

})().then(() => {
    logger.info("Generate complete");
});
