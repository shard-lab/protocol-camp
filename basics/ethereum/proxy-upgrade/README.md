# **EIP1967 Proxy Upgrade Learning**

## **1. Overview**

This repository illustrates how to implement an **Upgradeable Proxy** pattern using the **EIP-1967** specification for storage slots.  
We specifically focus on **slot conflicts** that can arise when upgrading contracts and how **EIP-1967** helps avoid them.

- **`Proxy.sol`**: A transparent proxy that delegates calls to an implementation contract.
- **`EIP1967Storage.sol`**: A versioned storage contract implementing EIP-1967 patterns for storing ownership.
- **`SlotConflicted.t.sol`**: Demonstrates how layout changes lead to storage conflicts in upgraded contracts.
- **Goal**: Fix the failing tests by properly implementing `_setOwner()` and `_getOwner()` in **`EIP1967Storage.sol`** using the EIP-1967 slot pattern.

## **2. Learning Objectives**

1. **EIP-1967 Storage Slots**

   - Understand how and why EIP-1967 defines specific storage slot positions.
   - Learn how these slots avoid collisions between proxy and implementation contract data.

2. **Proxy Upgrade Pattern**

   - Explore how a proxy uses `delegatecall` to preserve state while swapping contract logic.
   - Examine the role of `upgradeTo()` and how ownership or other data is maintained across upgrades.

3. **Slot Conflict Resolution**

   - See how different variable layouts in LogicV1 and LogicV2 can lead to unintended overwriting of storage.
   - Recognize how specifying a fixed storage slot (via EIP-1967) eliminates these conflicts.

4. **Implementation & Debugging**
   - Observe failing tests (`SlotConflicted.t.sol`) illustrating collisions when upgrading.
   - Correctly implement `_setOwner()` and `_getOwner()` in **`EIP1967Storage.sol`** using assembly.
   - Re-run tests to confirm that ownership and data persist as intended after upgrades.

## **3. Core Concepts**

### 3.1 **EIP-1967 Specification**

- **Motivation**: Avoid clashing storage among proxies and implementation contracts by assigning fixed slots.
- **Key Slots**:
  - `_IMPLEMENTATION_SLOT`: Stores the address of the logic contract.
  - `_ADMIN_SLOT` (or `_OWNER_SLOT` in our example): Stores the address of the contract admin or owner.
- **Result**: Even if the logic contract changes, the contract state remains consistent because all important values live in specific, stable slots.

### 3.2 **Proxy Mechanics**

- **delegatecall**: A low-level EVM instruction that executes code from another address but keeps the current contract’s storage.
- **`fallback()`** in `Proxy.sol`: Routes calls to the logic contract (`_implementation`).
- **`upgradeTo(newImpl)`**: Admin function that sets a new implementation address. State remains in the proxy but logic swaps.

### 3.3 **Storage Conflict**

- **Problem**: If `LogicV1` has `uint256 public counter` at slot 0, but `LogicV2` inserts another variable first (e.g. `address public owner` at slot 0), the upgraded code sees mismatched data.
- **Solution**: EIP-1967 defines a stable slot for each critical variable (`owner`, `implementation`), so logic changes won’t disrupt data layout.

## **4. Implementation Structure**

1. **`Proxy.sol`**

   - Minimal transparent proxy.
   - `constructor(initImpl)`: Sets initial implementation.
   - `fallback()`: Invokes `delegatecall(_implementation)`.
   - `upgradeTo(newImpl)`: Updates `_implementation`.

2. **`EIP1967Storage.sol`**

   - Demonstrates EIP-1967 approach for storing an `owner`.
   - **`_setOwner()`**, **`_getOwner()`** left as **TODO**: must store/load from the EIP-1967 slot using inline assembly.
   - Adds a `counter` variable for demonstration, plus `initialize(owner_)`, `setCounter(value)`, etc.

3. **Tests**
   - **`Proxy.t.sol`** (or a similarly named test file)
     - Deploys `Proxy` pointing to a simpler contract, then upgrades to `EIP1967Storage`.
     - Observes that unless `_setOwner()` and `_getOwner()` are correctly implemented, ownership remains `address(0)` or conflicts with other data.
   - Failing tests guide you to fix the slot usage.

## **5. Running Tests**

```bash
forge test
```

You’ll see tests fail where slot collisions occur or where `_setOwner()/_getOwner()` remain unimplemented.

## **6. Conclusion**

By fixing the `_setOwner()` and `_getOwner()` methods to use a **stable EIP-1967 storage slot**, you:

- Prevent **slot collisions** during upgrades.
- Ensure **delegatecall** logic changes don’t corrupt your contract state.
- Fully explore how **upgradable proxy** patterns and **EIP-1967** standards work in practice.
