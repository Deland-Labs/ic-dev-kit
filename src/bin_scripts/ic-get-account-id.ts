import { Principal } from '@dfinity/principal';
import logger from 'node-color-log';
import { principalToAccountIDInBytes, toHexString } from '../src/utils';

export const execute_task_get_account_id = (principal: string) => {
    let p: Principal;
    try {
        p = Principal.fromText(principal);
    } catch (e) {
        logger.error(`Invalid principal: ${principal}. ${e}`);
    }

    const accountIdBytes = principalToAccountIDInBytes(p);
    const accountIdHex = toHexString(accountIdBytes);

    // print
    logger.info(`Account ID for principal ${principal} is ${accountIdHex}`);
    logger.info(`Show as array: ${accountIdBytes}`);
}