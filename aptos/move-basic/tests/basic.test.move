module protocol::basic_test {
    #[test_only]
    use protocol::basic;

    #[test]
    public fun test_add() {
        let result = basic::add(10, 20);
        assert!(result == 30, 0);
    }

     #[test]
    public fun test_minus() {
        let result = basic::minus(20, 10);
        assert!(result == 10, 0);
    }

    #[test]
    public fun test_multiply() {
        let result = basic::multiply(3, 5);
        assert!(result == 15, 0);
    }

    #[test]
    public fun test_div() {
        let result = basic::div(20, 4);
        assert!(result == 5, 0);
    }

    #[test]
    #[expected_failure]
    public fun test_div_by_zero() {
        basic::div(20, 0); // Should abort due to division by zero
    }

    #[test]
    public fun test_mod() {
        let result = basic::mod(20, 3);
        assert!(result == 2, 0);
    }

    #[test]
    #[expected_failure]
    public fun test_mod_by_zero() {
        basic::mod(20, 0); // Should abort due to modulo by zero
    }

    #[test]
    public fun test_max() {
        let result = basic::max(5, 10);
        assert!(result == 10, 0);
    }

    #[test]
    public fun test_min() {
        let result = basic::min(5, 10);
        assert!(result == 5, 0);
    }

    #[test]
    public fun test_is_even() {
        let result = basic::is_even(4);
        assert!(result == true, 0);

        let result = basic::is_even(5);
        assert!(result == false, 0);
    }
}
