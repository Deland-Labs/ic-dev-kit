import fs from 'fs';
import logger from 'node-color-log';
import { exec } from 'shelljs';
import { icDevKitConfiguration, ICDevKitConfigurationCanisterSectionItem } from '../src/ICDevKitConfiguration';
import { IInstallCanisterInput } from '../src/types';
import * as canister from '../src/canister';
import { buildInCanisterParameterParser } from '../src/canisterInit';
import { addCanisterToDfxJson, AddCanisterToDfxJsonStatus } from '../src/dfxJson';

const npm = {
  installNpmPackage: (packageName: string, isSave?: boolean) => {
    logger.info(`Installing npm package ${packageName}`);
    let result = exec(`npm install ${packageName} ${isSave ? '--save' : ''}`);
    if (result.code !== 0) {
      logger.error(`Failed to install npm package ${packageName}`);
      throw new Error(`Failed to install npm package ${packageName}`);
    }
  },
  isInstalled: (packageName: string) => {
    // detect node_modules
    if (fs.existsSync(`./node_modules/${packageName}`)) {
      return true;
    }
    return false;
  }
};

async function installCanister(name: string, config: ICDevKitConfigurationCanisterSectionItem): Promise<void> {
  logger.debug(`Installing canister: ${name}`);
  if (!npm.isInstalled(config.package)) {
    logger.debug(`Installing npm package ${name}`);
    npm.installNpmPackage(config.package, true);
  }
  const status = addCanisterToDfxJson({
    name,
    type: 'custom',
    candid: `node_modules/${config.package}/index.did`,
    wasm: `node_modules/${config.package}/index.wasm`
  });
  if (status == AddCanisterToDfxJsonStatus.Success) {
    canister.create(name);
    canister.addMainAsController(name);
  }

  // install by different ways
  if ('command' in config.install) {
    // install by command
    logger.debug(`Installing canister: ${name} by command: ${config.install.command}`);
    // install by command
    let result = exec(config.install.command);
    if (result.code !== 0) {
      logger.error(`Failed to install canister: ${name}`);
      logger.error(result.stderr);
      throw new Error(`Failed to install canister: ${name}`);
    }
  } else if ('parameter' in config.install) {
    // install by parameters
    const parser = buildInCanisterParameterParser[config.package];
    if (parser) {
      // parse parameters
      const args = parser(config.install.parameter);
      await canister.reinstall_code(name, args);
    } else {
      logger.error(`Canister: ${name} does not have a parameter parser`);
      throw new Error(`Canister: ${name} does not have a parameter parser`);
    }
  } else {
    throw new Error(`Canister ${name} install config is invalid`);
  }
}

export const execute_task_install_canister = async (options: IInstallCanisterInput) => {
  const allCanisters = Object.keys(icDevKitConfiguration.install_canisters);
  let canister_to_be_install: string[] = [];
  if (options.name) {
    if (allCanisters.indexOf(options.name) === -1) {
      logger.error(`Canister ${options.name} not found`);
      throw new Error(`Canister ${options.name} not found`);
    }
    canister_to_be_install.push(options.name);
    logger.debug(`Installing canister: ${options.name}`);
  } else {
    canister_to_be_install = allCanisters;
    logger.debug(`Installing all canisters`);
  }

  for (let canister_name of canister_to_be_install) {
    await installCanister(canister_name, icDevKitConfiguration.install_canisters[canister_name]);
  }
};
