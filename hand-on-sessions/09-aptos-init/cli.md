Here’s a list of commonly used `aptos` CLI commands. These commands are essential for interacting with the Aptos network, managing accounts, deploying Move modules, executing scripts, and querying the blockchain.

### 1. **Account Management Commands**

- **Create a new account**:

  ```bash
  aptos account create
  ```

  Creates a new account, generating a key pair and account address.

- **Get account balance**:

  ```bash
  aptos account balance --account <account_address>
  ```

  Retrieves the balance of the specified account.

- **Get account sequence number**:
  ```bash
  aptos account list --account <account_address>
  ```
  Fetches the sequence number (used for tracking the latest transaction) for the account.

### 2. **Compile and Build Commands**

- **Initialize a new Move project**:

  ```bash
  aptos move init --name <project_name>
  ```

  Sets up a new Move project with the necessary directory structure and configuration.

- **Compile a Move package**:
  ```bash
  aptos move compile
  ```
  Compiles the Move modules and scripts in the current project.

### 3. **Deploy and Run Commands**

- **Publish a Move module**:

  ```bash
  aptos move publish --profile <profile_name>
  ```

  Deploys the compiled Move modules to the Aptos blockchain. Requires the `--profile` option to specify which account to use (from `aptos.config.toml`).

- **Run a Move script**:
  ```bash
  aptos move run --script-path <script_path> --args <arguments>
  ```
  Executes a Move script as a transaction. This command is useful for one-time operations or functions that need to interact with a deployed module.

### 4. **Testing and Debugging Commands**

- **Run tests**:

  ```bash
  aptos move test
  ```

  Executes tests in the `tests/` directory. It’s useful for verifying the functionality of Move modules before deployment.

- **View transaction status**:
  ```bash
  aptos transaction show --hash <transaction_hash>
  ```
  Displays details about a specific transaction by its hash, including whether it succeeded or failed and any outputs or errors.

### 5. **Network and Blockchain Queries**

- **Get current blockchain information**:

  ```bash
  aptos info
  ```

  Shows general information about the current blockchain network, such as the latest block height, chain ID, and epoch.

- **Query on-chain data**:
  ```bash
  aptos view --module <module_name> --function <function_name> --args <arguments>
  ```
  Calls a view function on the blockchain, allowing you to fetch on-chain data without creating a transaction or modifying state.

### 6. **Profile and Configuration Management**

- **Configure the CLI**:

  ```bash
  aptos init
  ```

  Sets up the CLI with configuration settings, including selecting a network (testnet, mainnet, devnet) and setting up account keys.

- **Add or manage profiles**:
  ```bash
  aptos config set-profile <profile_name>
  ```
  Manages multiple profiles within `aptos.config.toml`, which is helpful for switching between testnet, devnet, or custom configurations.

### 7. **Example Workflow Commands**

To illustrate how some of these commands work together, here’s a common workflow for deploying and interacting with a Move module on Aptos:

1. **Initialize a new project**:

   ```bash
   aptos move init --name MyProject
   ```

2. **Compile the Move modules**:

   ```bash
   aptos move compile
   ```

3. **Publish the Move module**:

   ```bash
   aptos move publish --profile default
   ```

4. **Run a script to interact with the module**:

   ```bash
   aptos move run --script-path scripts/my_script.move --args <args>
   ```

5. **Verify the transaction status**:
   ```bash
   aptos transaction show --hash <transaction_hash>
   ```

These commands cover the essentials for using the Aptos CLI. They’ll help you manage accounts, deploy and test Move modules, query blockchain data, and work with various network configurations.
