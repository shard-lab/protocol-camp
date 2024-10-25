module protocol::structability {

    struct DropStruct {
        value: u64,
    }

    public fun drop() {
        let _ = DropStruct { value: 42 };
    }

    struct CopyStruct has copy {
        value: u64,
    }

    public fun copy_() {
        let s = CopyStruct { value: 42 };
        let _ = s;
        let _ = s;
    }

    struct KeyStruct {
        value: u64,
    }

    public fun key(s: &signer) {
        let key = KeyStruct { value: 42 };
        move_to(s, key);
    }

    struct Resource has key {
        item: StoreStruct,
    }

    struct StoreStruct {
        value: u64,
    }

    public fun store(s: &signer) {
        let item = StoreStruct { value: 42 };
        let resource = Resource { item };
        move_to(s, resource);
    }
}
