export declare const DEFAULT_PEM_SOURCE_DIR = "./ic-dev-kit/pem";
export declare const DEFAULT_IDENTITY_NAME = "default";
export declare const DEFAULT_DECLARATIONS_OUT_DIR = "./src/declarations";
export interface ICDevKitConfigurationIdentitySection {
    pem_source_dir: string;
    default_identity: string;
}
export interface ICDevKitConfigurationCanisterSection {
    declarations_out_dir: string;
}
export interface ICDevKitConfiguration {
    identity: ICDevKitConfigurationIdentitySection;
    canister: ICDevKitConfigurationCanisterSection;
}
export declare const LoadICDevKitConfiguration: () => ICDevKitConfiguration;
