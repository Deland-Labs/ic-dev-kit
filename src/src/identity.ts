import {exec} from "shelljs";
import {Identity} from "@dfinity/agent";
import * as fs from "fs";
import {Secp256k1KeyIdentity} from "@dfinity/identity";
import sha256 from "sha256";
import {principalToAccountIDInBytes, toHexString} from "./utils";
import {Principal} from "@dfinity/principal";
import logger from "node-color-log";
import {ICDevKitConfigurationIdentitySection, LoadICDevKitConfiguration} from "./ICDevKitConfiguration";

function get_pem_path(name: string): string {
    // get current home directory
    const home = process.env.HOME;
    return `${home}/.config/dfx/identity/${name}/identity.pem`;
}

function load(name: string): Identity {
    // get current home directory
    const pem_path = get_pem_path(name);
    const rawKey = fs
        .readFileSync(pem_path)
        .toString()
        .replace("-----BEGIN EC PRIVATE KEY-----", "")
        .replace("-----END EC PRIVATE KEY-----", "")
        .trim();

    // @ts-ignore
    const rawBuffer = Uint8Array.from(rawKey).buffer;

    const privKey = Uint8Array.from(sha256(rawKey, {asBytes: true}));
    // Initialize an identity from the secret key
    return Secp256k1KeyIdentity.fromSecretKey(Uint8Array.from(privKey).buffer);
}

export const new_dfx_identity = (name: string) => {
    {
        let result = exec(`dfx identity new ${name}`, {silent: false});
        if (result.code !== 0) {
            logger.error(result.stderr);
            throw new Error(`Failed to create new identity ${name}`);
        }
    }
    // override static key file from scripts/identity_pem/${name}/identity.pem
    let target_pem_path = get_pem_path(name);
    {    // chmod 777 for target_pem_path
        let result = exec(`chmod 777 ${target_pem_path}`, {silent: false});
        if (result.code !== 0) {
            logger.error(result.stderr);
            throw new Error(`Failed to chmod 777 ${target_pem_path}`);
        }
    }
    let source_pem_path = `scripts/identity_pem/${name}/identity.pem`;
    fs.copyFileSync(source_pem_path, target_pem_path);
};

export const useDfxIdentity = (name: string) => {
    exec(`dfx identity use ${name}`, {silent: true});
};

export const deleteDfxIdentity = (name: string) => {
    exec(`dfx identity remove ${name}`, {silent: true});
};

export interface agentOptions {
    host: string;
    identity: Identity;
}

export interface IdentityInfo {
    identity: Identity;
    principalText: string;
    agentOptions: agentOptions;
}

const DEFAULT_HOST = "http://127.0.0.1:8000";

class IdentityFactory {
    private _identities: Map<string, IdentityInfo>;
    private _configuration: ICDevKitConfigurationIdentitySection;

    constructor() {
        this._identities = new Map<string, IdentityInfo>();
        this._configuration = LoadICDevKitConfiguration().identity;
    }

    private loadIdentityInfo = (name: string) => {
        const identity = load(name);
        const principal = identity.getPrincipal();
        const identityInfo: IdentityInfo = {
            identity: identity,
            principalText: principal.toText(),
            agentOptions: {
                host: DEFAULT_HOST,
                identity: identity,
            },
        };
        this._identities.set(name, identityInfo);
    };

    deleteIdentityInfo = (name: string) => {
        this._identities.delete(name);
        deleteDfxIdentity(name);
    };
    deleteIdentityInfos = () => {
        this._identities.forEach((value, key) => {
            this.deleteIdentityInfo(key);
        });
    };

    getDefaultHost = () => {
        return DEFAULT_HOST;
    };

    loadAllIdentities() {
        let identityNames = manager.getIdentityPemNames();
        if (identityNames.length == 0) {
            logger.info("There is no identity need to be import");
            return;
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
                new_dfx_identity(identity_name);
            }
        } else {
            logger.info("Identities already exist");
        }
        identityNames.forEach(this.loadIdentityInfo);

        // force to default identity in case of missing controller to local canisters when exec dfx
        useDfxIdentity("default");
    }

    getIdentity = (name?: string): IdentityInfo | undefined => {
        return this._identities.get(name || this.getDefaultIdentityName());
    };

    getPrincipals = (): { Principal; String }[] => {
        const principals: { Principal; String }[] = [];
        this._identities.forEach((identityInfo, Name) => {
            principals.push({
                Principal: identityInfo.identity.getPrincipal(),
                String: Name,
            });
        });
        return principals;
    };

    getPrincipal = (name?: string): Principal | undefined => {
        const identityInfo = this.getIdentity(name || this.getDefaultIdentityName());
        if (identityInfo) {
            return identityInfo.identity.getPrincipal();
        }
        return undefined;
    };

    getAccountIdHex = (name?: string, index?: number): string | undefined => {
        const identityInfo = this.getIdentity(name || this.getDefaultIdentityName());
        if (identityInfo) {
            const principal = identityInfo.identity.getPrincipal();
            const accountIdUint8 = principalToAccountIDInBytes(
                principal,
                this.getSubAccount(index ?? 0)
            );
            return toHexString(accountIdUint8);
        }
        return undefined;
    };

    getAccountIdBytes = (
        name?: string,
        index?: number
    ): Array<number> | undefined => {
        const identityInfo = this.getIdentity(name || this.getDefaultIdentityName());
        if (identityInfo) {
            const principal = identityInfo.identity.getPrincipal();
            const accountIdUint8 = principalToAccountIDInBytes(principal);
            return Array.from(accountIdUint8);
        }
        return undefined;
    };

    getSubAccount = (index: number) => {
        const subAccount = new Uint8Array(32).fill(0);
        subAccount[0] = index;
        return subAccount;
    };

    getIdentityPemNames(): string[] {
        return fs.readdirSync(this._configuration.pem_source_dir)
            .filter(file => file.endsWith(".pem"))
            .map(file => file.replace(".pem", ""));
    }

    getDefaultIdentityName(): string {
        return this._configuration.default_identity;
    }
}

export const identityFactory = new IdentityFactory();
identityFactory.loadAllIdentities();
