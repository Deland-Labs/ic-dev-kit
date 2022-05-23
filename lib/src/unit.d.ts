import BigNumber from "bignumber.js";
declare const zero: BigNumber;
declare const parseToCommon: (originTokenQty: bigint | string | BigNumber, tokenDecimals?: number | undefined, precision?: number | undefined) => BigNumber;
declare const parseToOrigin: (commonQty: bigint | string | BigNumber | number, tokenDecimals: number) => bigint;
declare const toPrecision: (originTokenQty: bigint | string | BigNumber, precision?: number | undefined) => BigNumber;
export { zero, parseToCommon, parseToOrigin, toPrecision };
