module protocol::basic2_test {
    #[test_only]
    use protocol::basic2;
    
    #[test]
    public fun test_sum_up_to_n() {
        let result = basic2::sum_up_to_n(5);
        assert!(result == 15, 0); // 0 + 1 + 2 + 3 + 4 + 5 = 15
    }

    #[test]
    public fun test_factorial() {
        let result = basic2::factorial(5);
        assert!(result == 120, 0); // 5! = 5 * 4 * 3 * 2 * 1 = 120
    }

    #[test]
    public fun test_sum_vector_elements() {
        let elements = vector[1, 2, 3, 4];
        let result = basic2::sum_vector_elements(elements);
        assert!(result == 10, 0); // 1 + 2 + 3 + 4 = 10
    }
}
