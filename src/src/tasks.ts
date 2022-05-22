import "./scripts/setup"
import {reinstall as reinstallWICP} from "~/canisters/token_WICP";
import {reinstall as reinstallWUSD} from "~/canisters/token_WUSD";
import {reinstall as reinstallFusion} from "~/canisters/fusion";
import {reinstall as reinstallBalanceKeeper} from "~/canisters/balance_keeper";
import {reinstall as reinstallEventStorage} from "~/canisters/event_storage";
import {reinstall as reinstallOrderBookDepth} from "~/canisters/orderbook_depth";
import {reinstall as reinstallOrderBookKline} from "~/canisters/orderbook_kline";
import {reinstall as reinstallOrderBookTradeList} from "~/canisters/orderbook_trade_list";
import {reinstall as reinstallBucketManager} from "~/canisters/bucket_manager";
import {reinstall as reinstallLedger} from "~/canisters/ledger";


export const reinstall_all = async (options?: CanisterReinstallOptions) => {
    // recode time of cost
    const start = Date.now();
    const get_jobs = function* () {
        yield step1();
        yield step2();
        yield step3();
        yield step4();

        function* step1() {
            // dft token_WUSD
            if (options && options.canisters?.token_WICP?.reinstall) {
                yield reinstallWICP({
                    ...options,
                }, options.canisters.token_WICP.initOptions);
            }
            // dft token_WICP
            if (options && options.canisters?.token_WUSD?.reinstall) {
                yield reinstallWUSD({...options,},
                    options.canisters.token_WUSD.initOptions);
            }

            // ledger
            if (options && options.canisters?.ledger?.reinstall) {
                yield reinstallLedger({...options,});
            }
        }

        function* step2() {
            // ex3 tx event_storage
            if (options && options.canisters?.event_storage?.reinstall) {
                yield reinstallEventStorage({...options,});
            }
            //ex3 tx bucket_manager
            if (options && options.canisters?.bucket_manager?.reinstall) {
                yield  reinstallBucketManager({...options});
            }
        }

        function* step3() {
            // ex3 balance_keeper
            if (options && options.canisters?.balance_keeper?.reinstall) {
                yield reinstallBalanceKeeper({...options});
            }

            // ex3 tx orderbook_kline
            if (options && options.canisters?.orderbook_kline?.reinstall) {
                yield  reinstallOrderBookKline({...options,});
            }
            // ex3 tx orderbook_depth
            if (options && options.canisters?.orderbook_depth?.reinstall) {
                yield  reinstallOrderBookDepth({...options,});
            }
            //ex3 tx orderbook_trade_list
            if (options && options.canisters?.orderbook_trade_list?.reinstall) {
                yield  reinstallOrderBookTradeList({...options,});
            }
        }

        function* step4() {
            // ex3 fusion
            if (options && options.canisters?.fusion?.reinstall) {
                yield  reinstallFusion({...options});
            }
        }

    };

    if (options && options.one_by_one) {
        for (const job_step of get_jobs()) {
            for (const job of job_step) {
                await job;
            }
        }
    } else {
        console.info("reinstall all in parallel");
        for (const job_step of get_jobs()) {
            await Promise.all(job_step);
        }
    }

    const end = Date.now();
    console.info(`reinstall all in ${end - start} ms`);
    // sleep for 3 seconds to waiting code to be available
    await new Promise((resolve) => setTimeout(resolve, 3000));
}

export interface Fee {
    minimum: number,
    rate: number,
    rate_decimals: number
}

export interface DFTInitOptions {
    name: string;
    symbol: string;
    decimals: bigint;
    totalSupply: bigint;
    fee?: Fee;
    desc?: Array<[string, string]>;
    owner: string;
    archive?: number;
    threshold?: number;
}


export interface CommonInstallOptions {
    reinstall: boolean;
}

export interface DFTInstallOptions extends CommonInstallOptions {
    initOptions?: DFTInitOptions;
}

export interface CanisterReinstallOptionsCanisters {
    token_WICP?: DFTInstallOptions;
    token_WUSD?: DFTInstallOptions;
    fusion?: CommonInstallOptions;
    event_storage?: CommonInstallOptions;
    balance_keeper?: CommonInstallOptions;
    orderbook_depth?: CommonInstallOptions;
    orderbook_kline?: CommonInstallOptions;
    orderbook_trade_list?: CommonInstallOptions;
    bucket_node?: CommonInstallOptions;
    bucket_manager?: CommonInstallOptions;
    ledger?: CommonInstallOptions;
}

export interface CanisterReinstallOptions {
    build?: boolean;
    init?: boolean;
    one_by_one?: boolean;
    canisters?: CanisterReinstallOptionsCanisters;
}
