# Aptos Wallet Integration Hands-on Session

## 1. Overview

This hands-on session focuses on building a simple Aptos wallet interface using React and the Aptos SDK. You'll learn how to connect to an Aptos wallet, fetch and display account balances, and initiate token transfers on the Aptos Testnet. This interface allows users to view their balance, transfer tokens to another address, and disconnect their wallet.

## 2. Functional Components

The session demonstrates key functionalities of the Aptos SDK and wallet integration, including fetching balances, submitting transactions, and managing wallet connections.

### Wallet Interface Components:

1. **Connecting to a Wallet**:

   - Uses `@aptos-labs/wallet-adapter-mui-design` and `@aptos-labs/wallet-adapter-react` to connect to an Aptos wallet on the Aptos Testnet.

2. **Maintaining Login State**:

   - The application maintains the wallet connection state even after a page refresh, ensuring a seamless user experience.

3. **Fetching Balance**:

   - Retrieves the APT token balance for the connected wallet account and displays it in APT units.

4. **Transferring Tokens**:

   - Allows users to input a recipient address and an amount of APT tokens to transfer, then submits the transaction.

5. **Disconnecting from Wallet**:
   - Provides an option to disconnect from the wallet and reset the session.

## 3. Running the Project

### Prerequisites

- Ensure that **Node.js** is installed.
- Set up the **Aptos Testnet** environment by installing necessary dependencies.

### Installation

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the project:
   ```bash
   npm run start
   ```

### Wallet and Balance Display

1. **Connect to Aptos Wallet**:

   - Use the `WalletConnector` component to select and connect to a wallet.

2. **Fetch Balance**:
   - Upon connection, the balance for the connected account will be displayed in the interface.

### Transaction Submission

1. **Transfer APT Tokens**:

   - Enter a recipient address and an amount to transfer.
   - Click the **Transfer** button to initiate the transaction.

2. **Transaction Feedback**:
   - After submission, a success or failure alert is displayed, and the balance updates accordingly.

### Disconnecting

1. **Disconnect Wallet**:
   - Clicking **Disconnect** will reset the wallet session.

## 4. Additional Notes

- **APT to Octas Conversion**: The Aptos blockchain represents token amounts in octas (1 APT = 10^8 octas), so conversion is necessary when displaying balances in APT units.
- **Testing on Testnet**: This project uses the Aptos Testnet for live transactions, so ensure network is set to `TESTNET`.
- **Error Handling**: The interface includes error alerts for transaction failures and validation checks for transfer input.

This hands-on session provides practical experience with wallet integration, token transfer, and managing account balances on the Aptos Testnet using the Aptos SDK and React.
