module protocol::structability_test {
    #[test_only]
    use protocol::structability;

    #[test]
    public fun test_drop() {
        structability::drop();
    }

    #[test]
    public fun test_copy() {
        structability::copy_();
    }

    #[test(s = @0xC0FFEE)]
    public fun test_key(s: signer) {
        structability::key(&s);
    }

    #[test(s = @0xC0FFEE)]
    public fun test_store(s: signer) {
        structability::store(&s);
    }
}
