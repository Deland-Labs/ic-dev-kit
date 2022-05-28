import { exec } from "shelljs";
import * as fs from "fs";
import logger from "node-color-log";
import {
    DEFAULT_IDENTITY_NAME,
    icDevKitConfiguration,
    ICDevKitConfigurationIdentitySection,
    LoadICDevKitConfiguration
} from "./ICDevKitConfiguration";

function get_pem_path(name: string): string {
    // get current home directory
    const home = process.env.HOME;
    return `${home}/.config/dfx/identity/${name}/identity.pem`;
}

const useDfxIdentity = (name: string) => {
    exec(`dfx identity use ${name}`, { silent: true });
};

const new_identity = (name: string) => {
    let result = exec(`dfx identity new ${name}`, { silent: false });
    if (result.code !== 0) {
        if (result.stderr.trim().endsWith("Error: Identity already exists.")) {
            logger.debug(`identity for ${name} already created`);
        } else {
            logger.error(result.stderr);
            throw new Error(`Failed to create new identity ${name}`);
        }
    }
}

export class IdentityInitialization {
    private _configuration: ICDevKitConfigurationIdentitySection;

    constructor() {
        this._configuration = LoadICDevKitConfiguration().identity;
    }

    import_identity = (name: string) => {
        new_identity(name);
        // override static key file from scripts/identity_pem/${name}/identity.pem
        let target_pem_path = get_pem_path(name);
        {    // chmod 777 for target_pem_path
            let result = exec(`chmod 777 ${target_pem_path}`, { silent: false });
            if (result.code !== 0) {

                logger.error(result.stderr);
                throw new Error(`Failed to chmod 777 ${target_pem_path}`);
            }
        }
        let source_pem_path = `${this._configuration.pem_source_dir}/${name}.pem`;
        if (!fs.existsSync(source_pem_path)) {
            logger.warn(`there is no identity.pem in ${source_pem_path}, it could be unstable for dev env`);
        } else {
            fs.copyFileSync(source_pem_path, target_pem_path);
        }
    }

    initAllIdentities() {
        let identityNames = this.getIdentityPemNames();
        if (identityNames.length == 0) {
            const defaultIdentity = icDevKitConfiguration.identity.default_identity;
            logger.info(`There is no identity need to be import, use default identity: ${defaultIdentity}`);
        }
        if (!identityNames.includes(DEFAULT_IDENTITY_NAME)) {
            identityNames.push(DEFAULT_IDENTITY_NAME);
        }

        let should_create_identities = false;
        for (const identity_name of identityNames) {
            const pem_path = get_pem_path(identity_name);
            if (!fs.existsSync(pem_path)) {
                should_create_identities = true;
                break;
            }
        }
        if (should_create_identities) {
            logger.info("Creating identities...");

            for (const identity_name of identityNames) {
                this.import_identity(identity_name);
            }
        } else {
            logger.info("Identities already exist");
        }

        // force to default identity in case of missing controller to local canisters when exec dfx
        useDfxIdentity("default");
    }

    getIdentityPemNames(): string[] {
        const source_dir = this._configuration.pem_source_dir;
        if (!fs.existsSync(source_dir)) {
            logger.debug(`pem source dir ${source_dir} not exist`);
            return [];
        }
        const files = fs.readdirSync(source_dir);
        return files
            .filter(file => file.endsWith(".pem"))
            .map(file => file.replace(".pem", ""));
    }

    getDefaultIdentityName(): string {
        return this._configuration.default_identity;
    }
}

export const identityInitialization = new IdentityInitialization();
