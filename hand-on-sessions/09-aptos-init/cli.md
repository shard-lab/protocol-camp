Here’s a list of commonly used `aptos` CLI commands. These commands are essential for interacting with the Aptos network, managing accounts, deploying Move modules, executing scripts, and querying the blockchain.

### 1. **Profile and Configuration Management**

- **Configure the CLI**:

  ```bash
  aptos init
  ```

  Sets up the CLI with configuration settings, including selecting a network (testnet, mainnet, devnet) and setting up account keys.

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

  Deploys the compiled Move modules to the Aptos blockchain. Requires the `--profile` option to specify which account to use (from `.aptos/config.toml`).

### 4. **Testing and Debugging Commands**

- **Run tests**:

  ```bash
  aptos move test
  ```

  Executes tests in the `tests/` directory. It’s useful for verifying the functionality of Move modules before deployment.

### 5. **Account Management Commands**

- **Fund with Faucet**:

  ```bash
  aptos account fund-with-faucet
  ```

  Retrieves the balance of the specified account.

- **Get account balance**:

  ```bash
  aptos account balance --account <account_address>
  ```

  Retrieves the balance of the specified account.

### 6. **Example Workflow Commands**

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

These commands cover the essentials for using the Aptos CLI. They’ll help you manage accounts, deploy and test Move modules, query blockchain data, and work with various network configurations.
