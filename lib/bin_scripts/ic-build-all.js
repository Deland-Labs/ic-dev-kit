#!/usr/bin/env node
import { canister } from "../src";
(async () => {
    await canister.createAll();
    canister.build_all();
})();
