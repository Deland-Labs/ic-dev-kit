import { HttpAgent } from "@dfinity/agent";
import { identityFactory } from "./identity";
import logger from 'node-color-log';
// This file may be used to polyfill features that aren't available in the test
// environment, i.e. JSDom.
//
// We sometimes need to do this because our target browsers are expected to have
// a feature that JSDom doesn't.
//
// Note that we can use webpack configuration to make some features available to
// Node.js in a similar way.

global.crypto = require("@trust/webcrypto");
global.TextEncoder = require("text-encoding").TextEncoder; // eslint-disable-line
global.TextDecoder = require("text-encoding").TextDecoder; // eslint-disable-line
global.fetch = require("node-fetch");
// @ts-ignore
BigInt.prototype.toJSON = function () {
    return this.toString();
};

const defaultIdentity = identityFactory.getIdentity();
if (defaultIdentity) {
    global.ic = {
        agent: new HttpAgent({
            host: "http://127.0.0.1:8000",
            identity: defaultIdentity.identity,
        }),
    };
} else {
    logger.warn("failed to get default identity, please run `npx ic init-identity` to set one");
}