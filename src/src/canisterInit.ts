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

export const buildInCanisterParameterParser = {
    "@deland-labs/ic_ledger_server": (obj: ICLedgerInitParameter) => {
        const p: ICLedgerInitParameter = obj;
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
            initial_values: p.initial_values ? p.initial_values.map(x => [Principal.fromText(x.account), { e8s: BigInt(x.icpts) }]) : []
        }

        return IDL.encode(icLedgerInit({ IDL }), [args]);
    }
}