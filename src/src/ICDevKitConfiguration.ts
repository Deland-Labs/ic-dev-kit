import fs from "fs";
import { merge } from "lodash";
import logger from "node-color-log";
export const IC_DEV_KIT_CONFIGURATION_FILE_NAME = "ic-dev-kit.json";
export const DEFAULT_PEM_SOURCE_DIR = "./ic-dev-kit/pem/";
export const DEFAULT_IDENTITY_NAME = "default";

export interface ICDevKitConfigurationIdentitySection {
  pem_source_dir: string;
  default_identity: string;
}

export interface ICDevKitConfigurationCanisterSectionItem {
  /// canister package to be install. e.g. @deland-labs/ic_ledger_server
  package: string;
  install: { command: string } | { parameter: object };
}

export interface ICDevKitConfiguration {
  identity: ICDevKitConfigurationIdentitySection;
  install_canisters: Map<string, ICDevKitConfigurationCanisterSectionItem>;
}

export const LoadICDevKitConfiguration = (
  filepath?: string
): ICDevKitConfiguration => {
  let config: {} = {};
  const default_config = {
    identity: {
      pem_source_dir: DEFAULT_PEM_SOURCE_DIR,
      default_identity: DEFAULT_IDENTITY_NAME,
    },
  };
  try {
    config = JSON.parse(
      fs.readFileSync(filepath ?? IC_DEV_KIT_CONFIGURATION_FILE_NAME).toString()
    );
    config = merge(default_config, config);
  } catch (e) {
    logger.info("No config file found, using default configuration");
    config = default_config;
  }
  // logger.debug(`Loaded configuration: ${JSON.stringify(config, null, 2)}`);
  return config as ICDevKitConfiguration;
};

export const icDevKitConfiguration = LoadICDevKitConfiguration();
