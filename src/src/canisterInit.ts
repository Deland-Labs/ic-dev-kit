import { IDL } from "@dfinity/candid";
import { Principal } from "@dfinity/principal";
import logger from "node-color-log";

export const icLedgerInit = ({ IDL }) => {
    const AccountIdentifier = IDL.Text;
    const Duration = IDL.Record({ 'secs': IDL.Nat64, 'nanos': IDL.Nat32 });
    const ArchiveOptions = IDL.Record({
        'num_blocks_to_archive': IDL.Nat64,
        'trigger_threshold': IDL.Nat64,
        'max_message_size_bytes': IDL.Opt(IDL.Nat64),
        'node_max_memory_size_bytes': IDL.Opt(IDL.Nat64),
        'controller_id': IDL.Principal,
    });
    const ICPTs = IDL.Record({ 'e8s': IDL.Nat64 });
    const LedgerCanisterInitPayload = IDL.Record({
        'send_whitelist': IDL.Vec(IDL.Principal),
        'minting_account': AccountIdentifier,
        'transaction_window': IDL.Opt(Duration),
        'max_message_size_bytes': IDL.Opt(IDL.Nat64),
        'archive_options': IDL.Opt(ArchiveOptions),
        'initial_values': IDL.Vec(IDL.Tuple(AccountIdentifier, ICPTs)),
    });
    return [LedgerCanisterInitPayload];
};


export interface ICLedgerInitParameter {
    send_whitelist: string[],
    minting_account: string,
    transaction_window?: { secs: number, nanos: number },
    max_message_size_bytes?: number,
    archive_options?: {
        num_blocks_to_archive: number,
        trigger_threshold: number,
        max_message_size_bytes?: number,
        node_max_memory_size_bytes?: number,
        controller_id: string
    },
    initial_values?: {
        account: string,
        icpts: number
    }[]
}


export const parseICLedgerInit = (input: ICLedgerInitParameter): ArrayBuffer => {
    const p: ICLedgerInitParameter = input;
    logger.debug("IC Ledger Init Parameter:", p);
    const args = {
        send_whitelist: p.send_whitelist.map(x => Principal.fromText(x)),
        minting_account: p.minting_account,
        transaction_window: p.transaction_window ? [{ secs: BigInt(p.transaction_window.secs), nanos: p.transaction_window.nanos }] : [],
        max_message_size_bytes: p.max_message_size_bytes ? [BigInt(p.max_message_size_bytes)] : [],
        archive_options: p.archive_options ? [{
            num_blocks_to_archive: BigInt(p.archive_options.num_blocks_to_archive),
            trigger_threshold: BigInt(p.archive_options.trigger_threshold),
            max_message_size_bytes: p.archive_options.max_message_size_bytes ? [BigInt(p.archive_options.max_message_size_bytes)] : [],
            node_max_memory_size_bytes: p.archive_options.node_max_memory_size_bytes ? [BigInt(p.archive_options.node_max_memory_size_bytes)] : [],
            controller_id: Principal.fromText(p.archive_options.controller_id)
        }] : [],
        initial_values: p.initial_values ? p.initial_values.map(x => [x.account, { e8s: BigInt(x.icpts) }]) : []
    }

    return IDL.encode(icLedgerInit({ IDL }), [args]);
}


export const DFTinit = ({ IDL }) => {
    const TokenFee = IDL.Record({
        'rate': IDL.Nat32,
        'minimum': IDL.Nat,
        'rateDecimals': IDL.Nat8,
    });
    const ArchiveOptions = IDL.Record({
        'num_blocks_to_archive': IDL.Nat32,
        'trigger_threshold': IDL.Nat32,
        'max_message_size_bytes': IDL.Opt(IDL.Nat32),
        'cycles_for_archive_creation': IDL.Opt(IDL.Nat64),
        'node_max_memory_size_bytes': IDL.Opt(IDL.Nat32),
    });
    return [
        IDL.Opt(IDL.Vec(IDL.Nat8)),
        IDL.Opt(IDL.Vec(IDL.Nat8)),
        IDL.Text,
        IDL.Text,
        IDL.Nat8,
        IDL.Nat,
        TokenFee,
        IDL.Opt(IDL.Principal),
        IDL.Opt(ArchiveOptions),
    ];
};

export interface DFTInitParameter {
    sub_account?: number[],
    logo?: number[],
    name: string,
    symbol: string,
    decimals: number,
    total_supply: string,
    fee: {
        rate: number,
        minimum: string,
        rateDecimals: number
    },
    caller?: string,
    archive_option?: {
        num_blocks_to_archive: number,
        trigger_threshold: number,
        max_message_size_bytes?: number,
        cycles_for_archive_creation?: string,
        node_max_memory_size_bytes?: number,
    }
}

export const parseDFTInit = (input: DFTInitParameter): ArrayBuffer => {
    logger.debug("DFT Init Parameter:", input);
    const args = [
        input.sub_account ? [input.sub_account] : [],
        input.logo ? [input.logo] : [],
        input.name,
        input.symbol,
        input.decimals,
        BigInt(input.total_supply),
        {
            rate: input.fee.rate,
            minimum: BigInt(input.fee.minimum),
            rateDecimals: input.fee.rateDecimals
        },
        input.caller ? [Principal.fromText(input.caller)] : [],
        input.archive_option ? [{
            num_blocks_to_archive: input.archive_option.num_blocks_to_archive,
            trigger_threshold: input.archive_option.trigger_threshold,
            max_message_size_bytes: input.archive_option.max_message_size_bytes ? [input.archive_option.max_message_size_bytes] : [],
            cycles_for_archive_creation: input.archive_option.cycles_for_archive_creation ? [BigInt(input.archive_option.cycles_for_archive_creation)] : [],
            node_max_memory_size_bytes: input.archive_option.node_max_memory_size_bytes ? [input.archive_option.node_max_memory_size_bytes] : [],
        }] : [],
    ]

    return IDL.encode(DFTinit({ IDL }), args);
}

export const buildInCanisterParameterParser = {
    "@deland-labs/ic_ledger_server": parseICLedgerInit,
    "@deland-labs/dft_all_features_server": parseDFTInit,
    "@deland-labs/dft_basic_server": parseDFTInit,
    "@deland-labs/dft_burnable_server": parseDFTInit,
    "@deland-labs/dft_mintable_server": parseDFTInit,
}