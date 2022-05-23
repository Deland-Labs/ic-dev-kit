import "./setup";
import * as icUtils2 from './utils';
export const utils = {
    ...icUtils2
}
import * as canister2 from "./canister";
export const canister = {
    ...canister2
}
import * as identity2 from "./identity";
export const identity = {
    ...identity2
}
import * as dfxJson2 from "./dfxJson";
export const dfxJson = {
    ...dfxJson2
}
import * as unit2 from "./unit";
export const unit = {
    ...unit2
}
import * as icBuildAll from "../bin_scripts/ic-build-all";
import * as icGenerate from "../bin_scripts/ic-generate";
import * as icInitIdentity from "../bin_scripts/ic-init-identity";
import * as icPack from "../bin_scripts/ic-pack";
import * as icUpdateDid from "../bin_scripts/ic-update-did";
export const tasks = {
    ...icBuildAll,
    ...icGenerate,
    ...icInitIdentity,
    ...icPack,
    ...icUpdateDid
}