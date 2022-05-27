import { IC_DEV_KIT_CONFIGURATION_FILE_NAME, LoadICDevKitConfiguration } from "../src/ICDevKitConfiguration";
import fs from "fs";
import { DEFAULT_DFX_PACKAGE_JSON, DEFAULT_DFX_PACKAGE_JSON_FILENAME } from "../src/dfxJson";

export const execute_task_init_dev_kit = () => {
    let config = LoadICDevKitConfiguration();
    fs.writeFileSync(IC_DEV_KIT_CONFIGURATION_FILE_NAME, JSON.stringify(config, null, 2));
    fs.writeFileSync(DEFAULT_DFX_PACKAGE_JSON_FILENAME, JSON.stringify(DEFAULT_DFX_PACKAGE_JSON, null, 2));
}