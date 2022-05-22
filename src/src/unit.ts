import BigNumber from "bignumber.js";
const zero = new BigNumber(0);
const parseToCommon = (
    originTokenQty: bigint | string | BigNumber,
    tokenDecimals?: number,
    precision?: number
): BigNumber => {
    if (tokenDecimals === undefined) tokenDecimals = 0;
    let bn = new BigNumber(originTokenQty.toString()).div(
        new BigNumber(10).pow(tokenDecimals)
    );
    if (precision)
        bn = new BigNumber(new BigNumber(bn.toFixed(precision)).toPrecision());
    return bn;
};

const parseToOrigin = (
    commonQty: bigint | string | BigNumber | number,
    tokenDecimals: number
): bigint => {
    // commonQty * 10^tokenDecimals
    if (typeof commonQty === "string") {
        // replace all _ with ''
        commonQty = commonQty.replace(/_/g, "");
    }
    const bigNumber = new BigNumber(commonQty.toString())
        .times(new BigNumber(10).pow(tokenDecimals));
    return BigInt(bigNumber.toFixed());
};

const toPrecision = (
    originTokenQty: bigint | string | BigNumber,
    precision?: number
): BigNumber => {
    let res: string;
    const bn = new BigNumber(originTokenQty.toString());
    if (precision) res = new BigNumber(bn.toFixed(precision)).toPrecision();
    else res = bn.toPrecision();
    return new BigNumber(res);
};

export { zero, parseToCommon, parseToOrigin, toPrecision };
