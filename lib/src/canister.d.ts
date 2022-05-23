import { Principal } from "@dfinity/principal";
export declare const create: (name: string) => void;
export declare const createAll: () => Promise<void>;
export declare const build: (name: string, canisterEnv?: string | undefined) => void;
export declare const build_all: () => import("shelljs").ShellString;
export declare const reinstall: (name: string, args?: string | undefined) => void;
export declare const uninstall_code: (name: string) => Promise<void>;
export declare const reinstall_code: (name: string, args?: ArrayBuffer | undefined) => Promise<void>;
export declare const addMainAsController: () => Promise<void>;
export declare const get_id: (name: string) => string;
export declare const get_principal: (name: string) => Principal;
export interface ReInstallOptions {
    build?: boolean;
    init?: boolean;
}
