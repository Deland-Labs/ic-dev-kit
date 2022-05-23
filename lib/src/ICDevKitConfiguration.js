import fs from "fs";
import logger from "node-color-log";
export const DEFAULT_PEM_SOURCE_DIR = './ic-dev-kit/pem';
export const DEFAULT_IDENTITY_NAME = "default";
export const DEFAULT_DECLARATIONS_OUT_DIR = "./src/declarations";
export const LoadICDevKitConfiguration = () => {
    let config = {};
    let default_config = {
        identity: {
            pem_source_dir: DEFAULT_PEM_SOURCE_DIR,
            default_identity: DEFAULT_IDENTITY_NAME
        },
        canister: {
            declarations_out_dir: DEFAULT_DECLARATIONS_OUT_DIR
        }
    };
    try {
        config = JSON.parse(fs.readFileSync('./ic-dev-kit.json').toString());
        config = { ...default_config, ...config };
    }
    catch (e) {
        logger.info('No config file found, using default configuration');
        config = {
            identity: {
                pem_source_dir: DEFAULT_PEM_SOURCE_DIR,
                default_identity: DEFAULT_IDENTITY_NAME
            },
        };
    }
    return config;
};
