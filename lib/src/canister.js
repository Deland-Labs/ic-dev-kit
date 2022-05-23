import { exec } from "shelljs";
import { Actor, CanisterInstallMode, HttpAgent } from "@dfinity/agent";
import { get_dfx_json, get_wasm_path } from "./dfxJson";
import * as fs from "fs";
import { identityFactory } from "./identity";
import logger from "node-color-log";
import { Principal } from "@dfinity/principal";
export const create = (name) => {
    const result = exec(`dfx canister create ${name}`);
    if (result.code !== 0) {
        throw new Error(result.stderr);
    }
};
export const createAll = async () => {
    //const result = exec(`dfx canister create --all --with-cycles 16000000000000`);
    const result = exec(`dfx canister create --all`);
    if (result.code !== 0) {
        throw new Error(result.stderr);
    }
};
export const build = (name, canisterEnv) => {
    let dfx_json = get_dfx_json();
    let canister = dfx_json.canisters.get(name);
    if (!canister) {
        throw new Error(`Canister ${name} not found in dfx.json`);
    }
    if (canister["type"] === "custom" && !canister.build) {
        logger.debug(`Canister ${name} is a custom canister without build scripts, skipping build`);
        return;
    }
    if (canisterEnv) {
        // set env var EX3_CANISTER_ENV=canisterEnv
        logger.debug(`Building canister ${name} with features ${canisterEnv}`);
        exec(`EX3_CANISTER_ENV=${canisterEnv} dfx build ${name}`);
    }
    else {
        logger.debug(`Building canister ${name}`);
        const result = exec(`dfx build ${name}`);
        if (result.code !== 0) {
            throw new Error(result.stderr);
        }
    }
};
export const build_all = () => {
    const result = exec(`dfx build`);
    if (result.code !== 0) {
        throw new Error(result.stderr);
    }
    return result;
};
export const reinstall = (name, args) => {
    logger.debug(`Reinstalling ${name}`);
    let result;
    if (args) {
        const command = `echo yes | dfx canister install --mode reinstall ${name} --argument ${args} `;
        logger.debug(`Running command: ${command}`);
        result = exec(command, { silent: true });
    }
    else {
        result = exec(`echo yes | dfx canister install --mode reinstall ${name}`, {
            silent: true,
        });
    }
    if (result.code !== 0) {
        throw new Error(result.stderr);
    }
    logger.info(`Reinstalled ${name}`);
};
export const uninstall_code = async (name) => {
    const result = exec(`dfx canister uninstall-code ${name}`);
    if (result.code !== 0) {
        throw new Error(result.stderr);
    }
    const max_retries = 30;
    for (let i = 0; i < max_retries; i++) {
        const info_result = exec(`dfx canister info ${name}`);
        if (info_result.code !== 0) {
            throw new Error(info_result.stderr);
        }
        const info = info_result.stdout;
        if (info.includes("Module hash: None")) {
            logger.debug(`${name} uninstallation complete`);
            return;
        }
        else {
            logger.debug(`${name} uninstallation in progress... ${i}/${max_retries}`);
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }
    }
};
export const reinstall_code = async (name, args) => {
    console.info(`Reinstalling ${name}`);
    const dfxJson = get_dfx_json();
    const canister = dfxJson.canisters.get(name);
    const wasmPath = get_wasm_path(canister);
    const buffer = fs.readFileSync(wasmPath);
    const canister_id = get_id(name);
    const agent = new HttpAgent(identityFactory.getIdentity().agentOptions);
    await agent.fetchRootKey();
    await Actor.install({
        module: buffer,
        mode: CanisterInstallMode.Reinstall,
        arg: args,
    }, {
        canisterId: canister_id,
        agent: agent,
    });
    console.info(`${name} reinstalled`);
};
export const addMainAsController = async () => {
    // add main identity as controller of all canisters
    const update_result = exec(`dfx canister update-settings --all --add-controller ${identityFactory.getPrincipal()}`);
    if (update_result.code !== 0) {
        throw new Error(update_result.stderr);
    }
};
export const get_id = (name) => {
    return exec(`dfx canister id ${name}`, { silent: true }).stdout.trim();
};
export const get_principal = (name) => {
    const text = get_id(name);
    return Principal.fromText(text);
};
