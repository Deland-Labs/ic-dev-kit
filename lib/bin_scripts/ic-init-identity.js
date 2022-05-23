import { canister } from "../src";
import { identityFactory } from "../src/identity";
import logger from "node-color-log";
identityFactory.loadAllIdentities();
// identities.json written to disk
logger.debug("Identities created");
canister.createAll();
canister.addMainAsController()
    .then(() => {
    logger.info("Main controller added");
});
