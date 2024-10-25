module mydapp_addr::MultSignerModule {
    use std::signer;

    struct Counter has key {
        value: u64,
        cosigner: address,
    }

    public entry fun init_counter(signer: &signer, cosigner_addr: address){
        let counter = Counter {
            value: 0,
            cosigner: cosigner_addr,
        };
        move_to(signer, counter);
    }

    public entry fun up(signer: &signer, cosigner: &signer) acquires Counter {
        let signer_addr = signer::address_of(signer);
        let cosigner_addr = signer::address_of(cosigner);

        assert!(exists<Counter>(signer_addr), 0);

        let counter_ref = borrow_global_mut<Counter>(signer_addr);
        assert!(counter_ref.cosigner == cosigner_addr, 1);

        counter_ref.value = counter_ref.value + 1;
    }

    public fun get(signer: &signer): u64 acquires Counter {
        let signer_addr = signer::address_of(signer);
        assert!(exists<Counter>(signer_addr), 0);

        let counter_ref = borrow_global_mut<Counter>(signer_addr);
        counter_ref.value
    }
}
