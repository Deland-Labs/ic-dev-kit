use std::future::Future;

use candid::{candid_method, decode_args, encode_args, Principal};
use ic_cdk::{api, trap};
use ic_cdk::api::call::{call_raw, CallResult};
use ic_cdk_macros::*;

#[update(name = "test_one_way_caller")]
#[candid_method(update)]
pub fn test_one_way_caller(ps: Principal, target: Principal) {

    // call the target without waiting for the result
    // no matter test_one_way_caller is async or not
    let args_raw = encode_args((ps, )).expect("Failed to encode arguments.");
    let result = call_raw(target.clone(), "test_one_way", args_raw, 0);

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