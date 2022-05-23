import { exec } from "shelljs";
import * as fs from "fs";
import { Secp256k1KeyIdentity } from "@dfinity/identity";
import sha256 from "sha256";
import { principalToAccountIDInBytes, toHexString } from "./utils";
import logger from "node-color-log";
import { LoadICDevKitConfiguration } from "./ICDevKitConfiguration";
function get_pem_path(name) {
    // get current home directory
    const home = process.env.HOME;
    return `${home}/.config/dfx/identity/${name}/identity.pem`;
}
function load(name) {
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
export const new_dfx_identity = (name) => {
    {
        let result = exec(`dfx identity new ${name}`, { silent: false });
        if (result.code !== 0) {
            logger.error(result.stderr);
            throw new Error(`Failed to create new identity ${name}`);
        }
    }
    // override static key file from scripts/identity_pem/${name}/identity.pem
    let target_pem_path = get_pem_path(name);
    { // chmod 777 for target_pem_path
        let result = exec(`chmod 777 ${target_pem_path}`, { silent: false });
        if (result.code !== 0) {
            logger.error(result.stderr);
            throw new Error(`Failed to chmod 777 ${target_pem_path}`);
        }
    }
    let source_pem_path = `scripts/identity_pem/${name}/identity.pem`;
    fs.copyFileSync(source_pem_path, target_pem_path);
};
export const useDfxIdentity = (name) => {
    exec(`dfx identity use ${name}`, { silent: true });
};
export const deleteDfxIdentity = (name) => {
    exec(`dfx identity remove ${name}`, { silent: true });
};
const DEFAULT_HOST = "http://127.0.0.1:8000";
class IdentityFactory {
    constructor() {
        this.loadIdentityInfo = (name) => {
            const identity = load(name);
            const principal = identity.getPrincipal();
            const identityInfo = {
                identity: identity,
                principalText: principal.toText(),
                agentOptions: {
                    host: DEFAULT_HOST,
                    identity: identity,
                },
            };
            this._identities.set(name, identityInfo);
        };
        this.deleteIdentityInfo = (name) => {
            this._identities.delete(name);
            deleteDfxIdentity(name);
        };
        this.deleteIdentityInfos = () => {
            this._identities.forEach((value, key) => {
                this.deleteIdentityInfo(key);
            });
        };
        this.getDefaultHost = () => {
            return DEFAULT_HOST;
        };
        this.getIdentity = (name) => {
            return this._identities.get(name || this.getDefaultIdentityName());
        };
        this.getPrincipals = () => {
            const principals = [];
            this._identities.forEach((identityInfo, Name) => {
                principals.push({
                    Principal: identityInfo.identity.getPrincipal(),
                    String: Name,
                });
            });
            return principals;
        };
        this.getPrincipal = (name) => {
            const identityInfo = this.getIdentity(name || this.getDefaultIdentityName());
            if (identityInfo) {
                return identityInfo.identity.getPrincipal();
            }
            return undefined;
        };
        this.getAccountIdHex = (name, index) => {
            const identityInfo = this.getIdentity(name || this.getDefaultIdentityName());
            if (identityInfo) {
                const principal = identityInfo.identity.getPrincipal();
                const accountIdUint8 = principalToAccountIDInBytes(principal, this.getSubAccount(index ?? 0));
                return toHexString(accountIdUint8);
            }
            return undefined;
        };
        this.getAccountIdBytes = (name, index) => {
            const identityInfo = this.getIdentity(name || this.getDefaultIdentityName());
            if (identityInfo) {
                const principal = identityInfo.identity.getPrincipal();
                const accountIdUint8 = principalToAccountIDInBytes(principal);
                return Array.from(accountIdUint8);
            }
            return undefined;
        };
        this.getSubAccount = (index) => {
            const subAccount = new Uint8Array(32).fill(0);
            subAccount[0] = index;
            return subAccount;
        };
        this._identities = new Map();
        this._configuration = LoadICDevKitConfiguration().identity;
    }
    loadAllIdentities() {
        let identityNames = this.getIdentityPemNames();
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
        }
        else {
            logger.info("Identities already exist");
        }
        identityNames.forEach(this.loadIdentityInfo);
        // force to default identity in case of missing controller to local canisters when exec dfx
        useDfxIdentity("default");
    }
    getIdentityPemNames() {
        return fs.readdirSync(this._configuration.pem_source_dir)
            .filter(file => file.endsWith(".pem"))
            .map(file => file.replace(".pem", ""));
    }
    getDefaultIdentityName() {
        return this._configuration.default_identity;
    }
}
export const identityFactory = new IdentityFactory();
identityFactory.loadAllIdentities();
