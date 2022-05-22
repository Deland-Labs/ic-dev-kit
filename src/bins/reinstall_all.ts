import "~/setup"
import {reinstall_all} from "./src/tasks"
import logger from "node-color-log";

(async () => {
    await reinstall_all({
        build: true,
        init: true,
        canisters: {
            token_WICP: {
                reinstall: false,
            },
            token_WUSD: {
                reinstall: false,
            },
            fusion: {
                reinstall: true
            },
            event_storage: {
                reinstall: true
            },
            balance_keeper: {
                reinstall: true
            },
            orderbook_depth: {
                reinstall: true
            },
            orderbook_kline: {
                reinstall: true
            },
            orderbook_trade_list: {
                reinstall: true
            },
            bucket_manager: {
                reinstall: true
            },
            ledger: {
                reinstall: true
            },
        }
    });
})().then(() => {
    logger.info("reinstall_all.ts: All done.");
}).catch((err) => {
    console.error("reinstall_all.ts: Error:", err);
});
