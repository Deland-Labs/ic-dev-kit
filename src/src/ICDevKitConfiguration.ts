import fs from "fs";
import logger from "node-color-log";

export const IC_DEV_KIT_CONFIGURATION_FILE_NAME = "ic-dev-kit.json";

export const DEFAULT_PEM_SOURCE_DIR = './ic-dev-kit/pem/';
export const DEFAULT_IDENTITY_NAME = "default";
export const DEFAULT_PACKAGE_SCOPE = "ic";
export const DEFAULT_BUILD_ENV_NAME = "CANISTER_ENV";
export const DEFAULT_PRODUCTION_ENV = "production";
export const DEFAULT_DECLARATIONS_OUT_DIR = "./src/declarations/";

export interface ICDevKitConfigurationIdentitySection {
    pem_source_dir: string;
    default_identity: string;
}

export interface ICDevKitConfigurationCanisterSection {
    build_env_name: string;
    production_env: string;
    declarations_out_dir: string;
}

export interface ICDevKitConfigurationPackSection {
    package_scope: string;
}

export interface ICDevKitConfiguration {
    identity: ICDevKitConfigurationIdentitySection;
    canister: ICDevKitConfigurationCanisterSection;
    pack: ICDevKitConfigurationPackSection;
}

export const LoadICDevKitConfiguration = (): ICDevKitConfiguration => {
    let config: {} = {};
    let default_config = {
        identity: {
            pem_source_dir: DEFAULT_PEM_SOURCE_DIR,
            default_identity: DEFAULT_IDENTITY_NAME
        },
        canister: {
            build_env: DEFAULT_BUILD_ENV_NAME,
            production_env: DEFAULT_PRODUCTION_ENV,
            declarations_out_dir: DEFAULT_DECLARATIONS_OUT_DIR
        },
        pack: {
            package_scope: DEFAULT_PACKAGE_SCOPE
        }
    };
    try {
        config = JSON.parse(fs.readFileSync(IC_DEV_KIT_CONFIGURATION_FILE_NAME).toString());
        // TODO how to merge?
        config = { ...default_config, ...config };
    } catch (e) {
        logger.info('No config file found, using default configuration');
        config = default_config;
    }
    logger.debug(`Loaded configuration: ${JSON.stringify(config, null, 2)}`);
    return config as ICDevKitConfiguration;
};


export const icDevKitConfiguration = LoadICDevKitConfiguration();