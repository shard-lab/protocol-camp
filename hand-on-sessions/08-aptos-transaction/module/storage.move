module AccountAddress::SimpleStorage {
    use std::signer;

    struct Storage has key, store {
        value: u64,
    }

    public entry fun set_value(account: &signer, value: u64) acquires Storage {
        let addr = signer::address_of(account);
        if (!exists<Storage>(addr)) {
            move_to(account, Storage { value });
        } else {
            let storage = borrow_global_mut<Storage>(addr);
            storage.value = value;
        }
    }

    #[view]
    public fun get_value(addr: address): u64 acquires Storage {
        if (!exists<Storage>(addr)) {
            return 0
        };

        let storage = borrow_global<Storage>(addr);
        storage.value
    }
}