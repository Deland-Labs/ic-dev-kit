use std::future::Future;

use candid::{candid_method, decode_args, encode_args, Principal,CandidType, Deserialize};
use ic_cdk::{api, trap};
use ic_cdk::api::call::{call_raw, CallResult};
use ic_cdk_macros::*;
use std::fmt;
use std::fmt::{Display, Formatter};

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
#[update(name = "test_one_way_response")]
#[candid_method(update)]
pub fn test_one_way_response(ps: Principal, target: Principal) ->BooleanActorResponse {
    BooleanActorResponse::new(true)
}
#[update(name = "test_one_way_response_error")]
#[candid_method(update)]
pub fn test_one_way_response_error(ps: Principal, target: Principal) ->BooleanActorResponse {
    BooleanActorResponse::new(false)
}

/// When export_service, actor responses will merged by enum type, so if there is two response with same Ok type, the second response will be ignored.
/// So there is no need to create more than one response type for two boolean ok.
#[derive(CandidType)]
pub enum BooleanActorResponse {
    Ok(bool),
    Err(ErrorInfo),
}

impl BooleanActorResponse {
    pub fn new(result: bool) -> BooleanActorResponse {
        match result {
            true => BooleanActorResponse::Ok(true),
            false => BooleanActorResponse::Err(ErrorInfo {
                code: 32,
                message: "TooManyResolverKeys".to_string(),
            }),
        }
    }
}


/// Error information
#[derive(Debug, Clone, Ord, PartialOrd, Eq, PartialEq, CandidType, Deserialize)]
pub struct ErrorInfo {
    /// Error code
    pub code: u32,
    /// Error message
    pub message: String,
}

impl Display for ErrorInfo {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        write!(f, "{} {}", self.code, self.message)
    }
}

candid::export_service!();

#[query(name = "__get_candid_interface_tmp_hack")]
#[candid_method(query, rename = "__get_candid_interface_tmp_hack")]
fn __export_did_tmp_() -> String {
    __export_service()
}
