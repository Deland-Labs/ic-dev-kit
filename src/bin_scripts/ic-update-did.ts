import {exec} from "shelljs";
import fs from "fs";
import logger from "node-color-log";
import {dfxJson as dfxJsonManager} from "../src";


const download_did = async (canister) => {
    const command = `dfx canister call ${canister} __get_candid_interface_tmp_hack`;
    logger.debug(`download_did : ${command}`);
    const result = exec(command, {silent: true});
    if (result.code !== 0) {
        logger.error(`${canister} : ${result.stderr}`);
        logger.warn(`${canister} : ${result.stdout}`);
        return "";
    }
    const source_content = result.stdout;
    // substring from first " to last "
    const start = source_content.indexOf("\"") + 1;
    const end = source_content.lastIndexOf("\"");
    let did_content = source_content.substring(start, end);
    // replace \\n with \n
    did_content = did_content.replace(/\\n/g, "\n");
    return did_content;
};

export const execute_task_update_did = async () => {
    let dfxJson = dfxJsonManager.get_dfx_json();
    for (const [name, config] of dfxJson.canisters.entries()) {
        if (config.pack_config?.exclude_in_package == true) {
            logger.debug(`${name} : excluded in package`);
            continue;
        }
        const did_file = `${config.candid}`;
        logger.debug(` ${name}: did_file: ${did_file}`);
        const did_content = await download_did(name);
        if (did_content === "") {
            logger.error(`${name} : download_did failed`);
            continue;
        }
        try {
            fs.writeFileSync(did_file, did_content);
            logger.info(`${name} : updated`);
        } catch (e) {
            logger.error(`${name} : ${e}`);
        }
    }

    logger.info("execute_task_update_did done");
}
