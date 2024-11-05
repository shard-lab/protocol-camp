module mydapp_addr::pow {
    use std::string::{String, Self};
    use std::vector;
    use std::hash;
    use std::signer;
    use std::coin::{deposit, Coin, Self};
    use std::aptos_coin::AptosCoin;
    use aptos_framework::coin::withdraw;
    use std::error;
    use std::option;

    const CHALLENGE: vector<u8> = b"Find the nonce!!";
    const EASY_DIFFICULTY: u64 = 2;
    const NORMAL_DIFFICULTY: u64 = 3;
    const HARD_DIFFICULTY: u64 = 4;

    struct Treasury has key {
        balance: Coin<AptosCoin>,
    }

    struct Solved has key {
        easy: option::Option<address>,
        normal: option::Option<address>,
        hard: option::Option<address>,
    }

    public entry fun initialize(account: &signer, amount: u64) {
        assert!(signer::address_of(account) == @mydapp_addr, error::permission_denied(1));
        let coin = withdraw<AptosCoin>(account, amount);
        move_to<Treasury>(account, Treasury { balance: coin });
        move_to<Solved>(account, Solved {
            easy: option::none<address>(),
            normal: option::none<address>(),
            hard: option::none<address>(),
        });
    }

    #[view]
    public fun get_treasury_balance(): u64 acquires Treasury {
        let treasury = borrow_global<Treasury>(@mydapp_addr);
        coin::value(&treasury.balance)
    }

    public entry fun proof_of_easy_work(account: &signer, nonce: u64) acquires Treasury, Solved {
        let solver = signer::address_of(account);
        let solved = borrow_global_mut<Solved>(@mydapp_addr);
        assert!(option::is_none(&solved.easy), error::already_exists(3));

        if (verify_proof(nonce, EASY_DIFFICULTY)) {
            solved.easy = option::some(solver);
            reward_user(solver, 200_000_000);
        }
    }

    public entry fun proof_of_normal_work(account: &signer, nonce: u64) acquires Treasury, Solved {
        let solver = signer::address_of(account);
        let solved = borrow_global_mut<Solved>(@mydapp_addr);
        assert!(option::is_none(&solved.normal), error::already_exists(3));

        if (verify_proof_with_hashed(nonce, NORMAL_DIFFICULTY)) {
            solved.normal = option::some(solver);
            reward_user(solver, 300_000_000);
        }
    }

    public entry fun proof_of_hard_work(account: &signer, nonce: u64) acquires Treasury, Solved {
        let solver = signer::address_of(account);
        let solved = borrow_global_mut<Solved>(@mydapp_addr);
        assert!(option::is_none(&solved.hard), error::already_exists(3));

        if (verify_proof(nonce, HARD_DIFFICULTY)) {
            solved.hard = option::some(solver);
            reward_user(solver, 1000_000_000);
        }
    }

    #[view]
    public fun get_easy_solved_status(): option::Option<address> acquires Solved {
        let solved = borrow_global<Solved>(@mydapp_addr);
        solved.easy
    }

    #[view]
    public fun get_normal_solved_status(): option::Option<address> acquires Solved {
        let solved = borrow_global<Solved>(@mydapp_addr);
        solved.normal
    }

    #[view]
    public fun get_hard_solved_status(): option::Option<address> acquires Solved {
        let solved = borrow_global<Solved>(@mydapp_addr);
        solved.hard
    }

    public fun verify_proof(nonce: u64, difficulty: u64): bool {
        let data = CHALLENGE;
        vector::append(&mut data, *string::bytes(&u64_to_string(nonce)));
        let hash_result = hash::sha2_256(data);
        check_difficulty(hash_result, difficulty)
    }

    public fun verify_proof_with_hashed(nonce: u64, difficulty: u64): bool {
        let data = hash::sha2_256(CHALLENGE);
        let h_nonce = hash::sha2_256(*string::bytes(&u64_to_string(nonce)));
        vector::append(&mut data, h_nonce);
        let hash_result = hash::sha2_256(data);
        check_difficulty(hash_result, difficulty)
    }

    public fun check_difficulty(hash_result: vector<u8>, difficulty: u64): bool {
        let i = 0;
        while (i < difficulty) {
            if (*vector::borrow(&hash_result, i) != 0u8) {
                abort error::invalid_argument(0)
            };
            i = i + 1;
        };
        true
    }

    public fun reward_user(user: address, amount: u64) acquires Treasury {
        let treasury = borrow_global_mut<Treasury>(@mydapp_addr);
        assert!(coin::value(&treasury.balance) >= amount, error::invalid_argument(2));
        let reward = coin::extract(&mut treasury.balance, amount);
        deposit<AptosCoin>(user, reward);
    }

    public fun u64_to_string(value: u64): String {
        let result = vector::empty<u8>();
        if (value == 0) {
            vector::push_back(&mut result, 48u8 + 0);
            return string::utf8(result)
        };

        let temp = value;
        while (temp > 0) {
            let digit = ((temp % 10) as u8);
            vector::push_back(&mut result, 48u8 + digit);
            temp = temp / 10;
        };

        let length = vector::length(&result);
        let i = 0;
        let j = length - 1;
        while (i < j) {
            let temp_byte = *vector::borrow(&result, i);
            *vector::borrow_mut(&mut result, i) = *vector::borrow(&result, j);
            *vector::borrow_mut(&mut result, j) = temp_byte;
            i = i + 1;
            j = j - 1;
        };

        string::utf8(result)
    }
}
