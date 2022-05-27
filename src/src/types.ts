export type CanisterIdString = string;
export type NeuronId = bigint;
export type AccountIdentifier = string;
export type BlockHeight = bigint;
export type E8s = bigint;
export type Memo = bigint;
export type PrincipalString = string;
export type SubAccount = Uint8Array;

export interface ICPackInput {
    packageScope: string,
    version: string,
    canisterEnv?: string,
    canisterEnvName: string,
    productionCanisterEnv: string,
}

export interface ICGenerateInput {
    declarationsOutDir: string,
}

export interface ICInitIdentityInput {
    pemSourceDir: string;
}

export interface ICShowPrincipalInput {
    name?: string;
}

