import fs from "fs";

export interface DfxJsonCanister {
    type: string;
    package: string;
    candid: string;
    dependencies?: string[];
    wasm?: string;
    
    build?: string[];
    pack_config?: DfxPackageCanister;
}

export const get_wasm_path = (name: string, canister: DfxJsonCanister): string => {
    if (canister?.wasm) {
        return canister.wasm;
    }
    return `target/wasm32-unknown-unknown/release/${name}.wasm`;
};

export interface DfxJson {
    canisters: Map<string, DfxJsonCanister>;
}

export class DfxJsonFile implements DfxJson {
    canisters: Map<string, DfxJsonCanister> = new Map();
    private readonly path: string;

    constructor(path = "./dfx.json") {
        this.path = path ?? "./dfx.json";
        this.load();
    }

    private load() {
        if (fs.existsSync(this.path)) {
            const json = fs.readFileSync(this.path, "utf8");
            const dfxJson: DfxJson = JSON.parse(json);
            const dfxPackageJson = get_dfx_package_json();
            for (const [key, value] of Object.entries(dfxJson.canisters)) {
                const pack_config = dfxPackageJson.getCanister(key);
                if (pack_config !== undefined) {
                    value.pack_config = pack_config;
                }
                this.canisters.set(key, value);
            }
        }
    }
}

export const get_dfx_json = (): DfxJson => {
    return new DfxJsonFile();
};

export interface DfxPackageJson {
    canisters: Map<string, DfxPackageCanister>;
    envs: DfxPackageEnv[];

    getCanister(canister_id: string): DfxPackageCanister | undefined;
}

export interface DfxPackageCanister {
    exclude_in_package?: boolean;
    exclude_in_integration_package?: boolean;
    pack_npm_client?: boolean;
    pack_npm_server?: boolean;
}

export interface DfxPackageEnv {
    name: string;
    canister_env: string;
}

export class FileDfxPackage implements DfxPackageJson {
    canisters: Map<string, DfxPackageCanister>;
    envs: DfxPackageEnv[];

    constructor(file_content: string) {
        this.canisters = new Map();
        const dfx_package_json = JSON.parse(file_content);
        for (const name in dfx_package_json["canisters"]) {
            this.canisters.set(
                name,
                dfx_package_json["canisters"][name] as DfxPackageCanister
            );
        }
        this.envs = [];
        for (const item of dfx_package_json["envs"]) {
            this.envs.push(item as DfxPackageEnv);
        }
    }

    getCanister(canister_id: string): DfxPackageCanister | undefined {
        return this.canisters.get(canister_id);
    }
}

export const get_dfx_package_json = (): DfxPackageJson => {
    const json = fs.readFileSync(DEFAULT_DFX_PACKAGE_JSON_FILENAME, "utf8");
    return new FileDfxPackage(json);
};

export const DEFAULT_DFX_PACKAGE_JSON_FILENAME = "dfx_package.json";
export const DEFAULT_DFX_PACKAGE_JSON = {
    canisters: {},
    envs: [{
        "name": "production",
        "canister_env": "production"
    }],
};


export interface addCanisterToDfxJsonInput {
    name: string;
    type: string;
    candid: string;
    wasm: string;
}

export enum AddCanisterToDfxJsonStatus {
    Success,
    CanisterExists,
}

export const addCanisterToDfxJson = (input: addCanisterToDfxJsonInput, dfxJsonPath?: string): AddCanisterToDfxJsonStatus => {
    const dfxJsonFilepath = dfxJsonPath ?? "./dfx.json";
    let json = fs.readFileSync(dfxJsonFilepath, "utf8");
    const dfxJson = JSON.parse(json);
    if (!dfxJson['canisters'].hasOwnProperty(input.name)) {
        dfxJson['canisters'][input.name] = {
            type: input.type,
            candid: input.candid,
            wasm: input.wasm,
        };
        fs.writeFileSync(dfxJsonFilepath, JSON.stringify(dfxJson, null, 2));
        return AddCanisterToDfxJsonStatus.Success;
    }
    return AddCanisterToDfxJsonStatus.CanisterExists;
}