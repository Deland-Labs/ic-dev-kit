import {canister} from "~/utils";
import fs from "fs";
import logger from "node-color-log";
import {get_dfx_json} from "~/utils/dfxJson";

(async () => {
    await canister.createAll();

    const dfx_json = get_dfx_json();

    const dir = `./env_configs`;
    // create dir if not exists
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true});
    }

    let env_file_content = "";
    for (const [name, _] of dfx_json.canisters) {
        const env_name = `EX3_CANISTER_ID_${name.toUpperCase()}`;
        const value = canister.get_id(name);
        env_file_content += `export ${env_name}=${value}\n`;
    }
    // write env file
    fs.writeFileSync(`${dir}/dev.canister_ids.env`, env_file_content);

    logger.debug("local canister ids updated");
})();
