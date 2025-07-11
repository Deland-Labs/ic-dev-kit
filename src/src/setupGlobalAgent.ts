import { HttpAgent } from '@dfinity/agent';
import { identityFactory } from './identity';
import logger from 'node-color-log';

const defaultIdentity = identityFactory.getIdentity();
if (defaultIdentity) {
  global.ic = {
    agent: new HttpAgent({
      host: identityFactory.getDefaultHost(), // Use dynamic host detection
      identity: defaultIdentity.identity
    })
  };
} else {
  logger.warn('failed to get default identity, please run `npx ic init-identity` to set one');
}
