#!/usr/bin/env node
import { canister } from "../src";

export const execute_task_build_all = async () => {
    await canister.createAll();
    canister.build_all();
}