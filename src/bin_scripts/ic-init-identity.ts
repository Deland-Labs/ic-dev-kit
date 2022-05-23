import {canister} from "../src";
import {identityFactory} from "../src/identity";
import logger from "node-color-log";


export const execute_task_init_identity = () => {
    identityFactory.loadAllIdentities();
    // identities.json written to disk
    logger.debug("Identities created");
    
    canister.createAll();
    canister.addMainAsController()
        .then(() => {
            logger.info("Main controller added");
        });

    logger.info("execute_task_init_identity done");
}