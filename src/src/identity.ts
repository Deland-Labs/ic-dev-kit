import { exec } from "shelljs";
import { Identity } from "@dfinity/agent";
import * as fs from "fs";
import { Secp256k1KeyIdentity } from "@dfinity/identity";
import sha256 from "sha256";
import { principalToAccountIDInBytes, toHexString } from "./utils";
import { Principal } from "@dfinity/principal";
import logger from "node-color-log";
import {
    DEFAULT_IDENTITY_NAME,
    ICDevKitConfigurationIdentitySection,
    LoadICDevKitConfiguration
} from "./ICDevKitConfiguration";
import { ICShowPrincipalInput } from "./types";
import { identityInitialization } from "./identityInitialization";
import os from "os";

function get_pem_path(name: string): string {
    // get current home directory
    const home = os.homedir();
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

    const privKey = Uint8Array.from(sha256(rawKey, { asBytes: true }));
    // Initialize an identity from the secret key
    return Secp256k1KeyIdentity.fromSecretKey(Uint8Array.from(privKey).buffer);
}

export const useDfxIdentity = (name: string) => {
    exec(`dfx identity use ${name}`, { silent: true });
};

export const deleteDfxIdentity = (name: string) => {
    exec(`dfx identity remove ${name}`, { silent: true });
};

export const getDfxPrincipal = (): string => {
    let result = exec(`dfx identity get-principal`, { silent: true });
    return result.trim();
}

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

export class IdentityFactory {
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

    ensureIdentityLoaded() {
        if (this._identities.size == 0) {
            let identityNames = identityInitialization.getIdentityPemNames();
            if (!identityNames.includes(DEFAULT_IDENTITY_NAME)) {
                identityNames.push(DEFAULT_IDENTITY_NAME);
            }
            identityNames.forEach(this.loadIdentityInfo);
        }
    }

    deleteIdentityInfo = (name: string) => {
        this.ensureIdentityLoaded();
        this._identities.delete(name);
        deleteDfxIdentity(name);
    };
    deleteIdentityInfos = () => {
        this.ensureIdentityLoaded();
        this._identities.forEach((value, key) => {
            this.deleteIdentityInfo(key);
        });
    };

    getDefaultHost = () => {
        return DEFAULT_HOST;
    };

    getIdentity = (name?: string): IdentityInfo | undefined => {
        this.ensureIdentityLoaded();

        return this._identities.get(name || this.getDefaultIdentityName());
    };

    getPrincipals = (): { Principal; String }[] => {
        this.ensureIdentityLoaded();

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
        this.ensureIdentityLoaded();

        const identityInfo = this.getIdentity(name || this.getDefaultIdentityName());
        if (identityInfo) {
            return identityInfo.identity.getPrincipal();
        }
        return undefined;
    };

    getAccountIdHex = (name?: string, index?: number): string | undefined => {
        this.ensureIdentityLoaded();

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
        this.ensureIdentityLoaded();

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

    getDefaultIdentityName(): string {
        return this._configuration.default_identity;
    }

    printIdentity(input: ICShowPrincipalInput) {
        this.ensureIdentityLoaded();

        let content = "principal:\n";
        const append_content = (name: string, info: IdentityInfo) => {
            content += `# ${name} node\n`;
            content += `${info.identity.getPrincipal().toString()}\n`;
            content += `# ${name} dfx\n`;
            useDfxIdentity(name);
            content += `${getDfxPrincipal()}\n`
        }

        if (input.name) {
            const identityInfo = this._identities.get(input.name);
            if (identityInfo) {
                append_content(input.name, identityInfo);
            } else {
                logger.error(`identity ${input.name} not exist`);
            }
        } else {
            for (const [key, value] of this._identities) {
                append_content(key, value);
            }
        }

        logger.info(content);
        logger.info("switch identity to default")
        useDfxIdentity("default");
    }
}

export const identityFactory = new IdentityFactory();
