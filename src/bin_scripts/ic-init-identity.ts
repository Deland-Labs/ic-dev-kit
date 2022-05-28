import { canister } from "../src";
import logger from "node-color-log";
import { identityInitialization } from "../src/identityInitialization";


export const execute_task_init_identity = () => {
    identityInitialization.initAllIdentities();
    // identities.json written to disk
    logger.debug("Identities created");

    canister.createAll();
    require("../src/setupGlobalAgent");
    canister.addMainAsController()
        .then(() => {
            logger.info("Main controller added");
        });

    logger.info("execute_task_init_identity done");
}