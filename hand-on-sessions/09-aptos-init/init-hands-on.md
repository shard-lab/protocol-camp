### Exercise: Setting Up and Testing a Simple Move Project

#### 1. Initialize a New Move Project

First, use the `aptos move init` command to create a new Move project structure.

```bash
aptos move init --name SimpleStorageProject
```

- This command will create a directory named `SimpleStorageProject` with all necessary folders and configuration files.
- Navigate into the project folder:

  ```bash
  cd SimpleStorageProject
  ```

#### 2. Create a Simple Storage Module

Next, create a module that stores and retrieves a simple value.

1. Inside the `sources/` folder, create a new file named `SimpleStorage.move`:

   ```bash
   touch sources/SimpleStorage.move
   ```

2. Open `SimpleStorage.move` and add the following code:

   ```move
   module SimpleStorageProject::SimpleStorage {
       use std::signer;

       struct Storage has key {
           value: u64,
       }

       /// Function to set a value in storage
       public entry fun set_value(account: &signer, value: u64) acquires Storage {
           let addr = signer::address_of(account);
           if (!exists<Storage>(addr)) {
               move_to(account, Storage { value });
           } else {
               let storage = borrow_global_mut<Storage>(addr);
               storage.value = value;
           }
       }

       /// Function to get the stored value
       public fun get_value(addr: address): u64 acquires Storage {
           if (!exists<Storage>(addr)) {
               return 0;
           };
           let storage = borrow_global<Storage>(addr);
           storage.value
       }
   }
   ```

   - **`set_value`**: Stores a value associated with the signer’s account.
   - **`get_value`**: Retrieves the value stored by an account; returns `0` if no value is stored.

#### 3. Create a Test for the Module

To verify that the module works as expected, let’s add a test.

1. In the `tests/` folder, create a new file named `SimpleStorage_test.move`:

   ```bash
   touch tests/SimpleStorage_test.move
   ```

2. Open `SimpleStorage_test.move` and add the following code:

   ```move
   module SimpleStorageProject::SimpleStorage_test {
       use SimpleStorageProject::SimpleStorage;
       use std::signer;
       use aptos_framework::aptos_account;

       #[test]
       public entry fun test_storage(account: signer) {
           // Set a value in storage
           SimpleStorage::set_value(&account, 100);

           // Get the value and check if it's correct
           let address = signer::address_of(&account);
           let value = SimpleStorage::get_value(address);
           assert!(value == 100, 0);
       }
   }
   ```

   - **Explanation**: This test sets a value of `100` in the storage and verifies that `get_value` retrieves the correct value.

#### 4. Run the Test

Now, run the test to verify the module works as expected.

```bash
aptos move test
```

- If the test is successful, it means your `SimpleStorage` module works as intended.
- Any errors or failures in the output will help you debug and verify the logic.

#### 5. Summary

You’ve now:

- Initialized a new Move project,
- Created a simple storage module that sets and retrieves a value, and
- Added a test to validate its functionality.

This basic setup serves as a foundation for developing more complex modules and testing interactions within the Aptos Move ecosystem.
