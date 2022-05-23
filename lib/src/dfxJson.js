import fs from "fs";
export const get_wasm_path = (canister) => {
    if (canister?.wasm) {
        return canister.wasm;
    }
    return `target/wasm32-unknown-unknown/release/${canister.package}.wasm`;
};
export class DfxJsonFile {
    constructor(path = "./dfx.json") {
        this.canisters = new Map();
        this.path = path ?? "./dfx.json";
        this.load();
    }
    load() {
        if (fs.existsSync(this.path)) {
            const json = fs.readFileSync(this.path, "utf8");
            const dfxJson = JSON.parse(json);
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
export const get_dfx_json = () => {
    return new DfxJsonFile();
};
export class FileDfxPackage {
    constructor(file_content) {
        this.canisters = new Map();
        const dfx_package_json = JSON.parse(file_content);
        for (const name in dfx_package_json["canisters"]) {
            this.canisters.set(name, dfx_package_json["canisters"][name]);
        }
        this.envs = [];
        for (const item of dfx_package_json["envs"]) {
            this.envs.push(item);
        }
    }
    getCanister(canister_id) {
        return this.canisters.get(canister_id);
    }
}
export const get_dfx_package_json = () => {
    const json = fs.readFileSync("./dfx_package.json", "utf8");
    return new FileDfxPackage(json);
};
