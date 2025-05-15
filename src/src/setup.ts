// This file may be used to polyfill features that aren't available in the test
// environment, i.e. JSDom.
//
// We sometimes need to do this because our target browsers are expected to have
// a feature that JSDom doesn't.
//
// Note that we can use webpack configuration to make some features available to
// Node.js in a similar way.

Object.defineProperty(global, "crypto", {
    value: require("@trust/webcrypto"),
    configurable: true,
});
global.TextEncoder = require("text-encoding").TextEncoder; // eslint-disable-line
global.TextDecoder = require("text-encoding").TextDecoder; // eslint-disable-line
global.fetch = require("node-fetch");
// @ts-ignore
BigInt.prototype.toJSON = function () {
    return this.toString();
};

// Make this file a module
export {};
