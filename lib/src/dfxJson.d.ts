export interface DfxJsonCanister {
    type: string;
    package: string;
    candid: string;
    dependencies?: string[];
    wasm?: string;
    build?: string[];
    pack_config?: DfxPackageCanister;
}
export declare const get_wasm_path: (canister: DfxJsonCanister) => string;
export interface DfxJson {
    canisters: Map<string, DfxJsonCanister>;
}
export declare class DfxJsonFile implements DfxJson {
    canisters: Map<string, DfxJsonCanister>;
    private readonly path;
    constructor(path?: string);
    private load;
}
export declare const get_dfx_json: () => DfxJson;
export interface DfxPackageJson {
    canisters: Map<string, DfxPackageCanister>;
    envs: DfxPackageEnv[];
    getCanister(canister_id: string): DfxPackageCanister | undefined;
}
export interface DfxPackageCanister {
    exclude_in_package?: boolean;
    copy_ts_declarations?: boolean;
}
export interface DfxPackageEnv {
    name: string;
    canister_env: string;
}
export declare class FileDfxPackage implements DfxPackageJson {
    canisters: Map<string, DfxPackageCanister>;
    envs: DfxPackageEnv[];
    constructor(file_content: string);
    getCanister(canister_id: string): DfxPackageCanister | undefined;
}
export declare const get_dfx_package_json: () => DfxPackageJson;
