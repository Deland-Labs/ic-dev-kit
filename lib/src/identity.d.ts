import { Identity } from "@dfinity/agent";
import { Principal } from "@dfinity/principal";
export declare const new_dfx_identity: (name: string) => void;
export declare const useDfxIdentity: (name: string) => void;
export declare const deleteDfxIdentity: (name: string) => void;
export interface agentOptions {
    host: string;
    identity: Identity;
}
export interface IdentityInfo {
    identity: Identity;
    principalText: string;
    agentOptions: agentOptions;
}
declare class IdentityFactory {
    private _identities;
    private _configuration;
    constructor();
    private loadIdentityInfo;
    deleteIdentityInfo: (name: string) => void;
    deleteIdentityInfos: () => void;
    getDefaultHost: () => string;
    loadAllIdentities(): void;
    getIdentity: (name?: string | undefined) => IdentityInfo | undefined;
    getPrincipals: () => {
        Principal;
        String;
    }[];
    getPrincipal: (name?: string | undefined) => Principal | undefined;
    getAccountIdHex: (name?: string | undefined, index?: number | undefined) => string | undefined;
    getAccountIdBytes: (name?: string | undefined, index?: number | undefined) => Array<number> | undefined;
    getSubAccount: (index: number) => Uint8Array;
    getIdentityPemNames(): string[];
    getDefaultIdentityName(): string;
}
export declare const identityFactory: IdentityFactory;
export {};
