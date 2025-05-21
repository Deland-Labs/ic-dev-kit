import { HttpAgent } from '@dfinity/agent';
import { identityFactory } from './identity';
import logger from 'node-color-log';
const defaultIdentity = identityFactory.getIdentity();
if (defaultIdentity) {
  global.ic = {
    agent: new HttpAgent({
      host: 'http://127.0.0.1:8000',
      identity: defaultIdentity.identity
    })
  };
} else {
  logger.warn('failed to get default identity, please run `npx ic init-identity` to set one');
}
