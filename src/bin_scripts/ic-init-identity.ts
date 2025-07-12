import * as canister from '../src/canister';
import logger from 'node-color-log';
import { identityInitialization } from '../src/identityInitialization';

export const execute_task_init_identity = async () => {
  identityInitialization.initAllIdentities();
  // identities.json written to disk
  logger.debug('Identities created');

  await import('../src/setupGlobalAgent');
  canister.createAll();
  await canister.addMainAsController();
  logger.info('Main controller added');

  logger.info('execute_task_init_identity done');
};
