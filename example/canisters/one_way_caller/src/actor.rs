use candid::{candid_method, decode_args, encode_args, Principal};
use ic_cdk::api;
use ic_cdk::api::call::call_raw;
use ic_cdk_macros::*;
use crate::nft::{Fungible, FungibleUser, Metadata, NonFungible, TokenIdentifier};

#[update(name = "test_one_way_caller")]
#[candid_method(update)]
pub fn test_one_way_caller(ps: Principal, target: Principal) {

    // call the target without waiting for the result
    // no matter test_one_way_caller is async or not
    let args_raw = encode_args((ps, )).expect("Failed to encode arguments.");
    let result = call_raw(target.clone(), "test_one_way", args_raw.as_slice(), 0);

    // this does not work
    // let result = ic_cdk::call::<(Principal, ), ()>(target.clone(), "test_one_way", (ps, ));

    // this is waiting for the result of the call
    // let result = call_raw(target.clone(), "test_one_way", args_raw, 0).await;
    // result.unwrap();

    // this is waiting for the result
    // let result: CallResult<()> = ic_cdk::call(target.clone(), "test_one_way", (ps, )).await;
    // result.unwrap();
    api::print(format!("one way result is returned"));
}
#[query(name = "metadataNonFungible")]
#[candid_method(query)]
fn metadata_non_fungible(token: TokenIdentifier) -> Metadata {
    let metadata = Metadata::NonFungible(NonFungible {
        metadata: Some("test".as_bytes().to_vec()),
    });
    metadata
}
#[query(name = "metadataFungible")]
#[candid_method(query)]
fn metadata_fungible(token: TokenIdentifier) -> Metadata {
    let metadata = Metadata::Fungible(Fungible{
        name : FungibleUser::Principal(Principal::anonymous()),
        symbol: Principal::anonymous(),
        decimals: TokenIdentifier {
            value: "0".to_string(),
        },
        metadata: Some("test".as_bytes().to_vec()),
    });
    metadata
}

candid::export_service!();
#[query(name = "__get_candid_interface_tmp_hack")]
#[candid_method(query, rename = "__get_candid_interface_tmp_hack")]
fn __export_did_tmp_() -> String {
    __export_service()
}
