module protocol::resource_test {
    #[test_only]
    use protocol::resource;
    #[test_only]
    use std::signer;

    // Create a new resource to global storage
    #[test(s = @0xC0FFEE)]
    public fun test_create_resource(s: signer) {
        let initial_value = 100;
        resource::create_resource(&s, initial_value);
    }

    // Modify the value of the resource
    #[test(s = @0xC0FFEE)]
    public fun test_modify_resource(s: signer) {
        let addr = signer::address_of(&s);
        let initial_value = 100;
        resource::create_resource(&s, initial_value);

        // Modify the resource's value
        resource::modify_resource(addr, 200);

        // Verify the modified value
        let updated_value = resource::view_resource(addr);
        assert!(updated_value == 200, 0);
    }

    // View and modify the resource
    #[test(s = @0xC0FFEE)]
    public fun test_reference_rules(s: signer) {
        let addr = signer::address_of(&s);
        resource::create_resource(&s, 300);

        // View the resource after modifying
        let current_value = resource::view_resource(addr);
        assert!(current_value == 300, 0);

        // Try to modify after viewing; this will ensure we are following borrowing rules
        resource::modify_resource(addr, 400);

        assert!(resource::view_resource(addr) == 400, 0);
    }

    //  Delete the resource from global storage
    #[test(s = @0xC0FFEE)]
    public fun test_delete_resource(s: signer) {
        let addr = signer::address_of(&s);
        resource::create_resource(&s, 300);

        // Delete the resource
        resource::delete_resource(addr);
    }
}
