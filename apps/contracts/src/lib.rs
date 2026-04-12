#![no_std]

use soroban_sdk::{contractimpl, symbol, BytesN, Env};

pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    pub fn initialize(env: Env, owner: BytesN<32>, amount: i128) {
        env.storage().set(&symbol!(OWNER), &owner);
        env.storage().set(&symbol!(AMOUNT), &amount);
    }

    pub fn get_owner(env: Env) -> BytesN<32> {
        env.storage().get_unchecked(&symbol!(OWNER))
    }

    pub fn get_amount(env: Env) -> i128 {
        env.storage().get_unchecked(&symbol!(AMOUNT))
    }
}

mod storage {
    soroban_sdk::contractimport! {
        contract: "../specs/escrow.rs"
    }
}
