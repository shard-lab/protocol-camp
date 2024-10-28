// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract Rollup {
    struct RollupState {
        bytes32 blockMerkleRoot;
        bytes32 stateMerkleRoot;
        uint256 timestamp; // Time when the state was proposed
    }

    struct AccountState {
        address addr;
        uint256 nonce;
        uint256 balance;
    }

    struct Transaction {
        address from;
        address to;
        uint256 amount;
        uint256 nonce;
    }

    RollupState[] public proposed;
    RollupState[] public finalized;

    uint256 public finalizationPeriod; // Time period required before a state can be finalized

    event RollupProposed(
        uint256 index,
        bytes32 blockMerkleRoot,
        bytes32 stateMerkleRoot,
        uint256 timestamp
    );
    event RollupFinalized(
        uint256 index,
        bytes32 blockMerkleRoot,
        bytes32 stateMerkleRoot
    );
    event RollupInvalidated(
        uint256 index,
        bytes32 blockMerkleRoot,
        bytes32 stateMerkleRoot
    );

    constructor(
        uint256 _finalizationPeriod,
        bytes32 _initialBlockMerkleRoot,
        bytes32 _initialStateMerkleRoot
    ) {
        finalizationPeriod = _finalizationPeriod;
        RollupState memory initialRollup = RollupState({
            blockMerkleRoot: _initialBlockMerkleRoot,
            stateMerkleRoot: _initialStateMerkleRoot,
            timestamp: block.timestamp
        });
        finalized.push(initialRollup);
    }

    function proposeState(
        bytes32 _blockMerkleRoot,
        bytes32 _stateMerkleRoot
    ) external {
        // 1. Create a new RollupState with the provided block and state Merkle roots and current timestamp
        // 2. Add the new state to the proposed array
        // 3. Emit RollupProposed event with index, roots, and timestamp
    }

    function finalizeState(uint256 _index) external {
        // 1. Check if the provided index is valid
        // 2. Get the state to finalize from the proposed array
        // 3. Check if the finalization period has passed
        // 4. Add the state to the finalized array
        // 5. Remove the state from the proposed array by shifting elements
        // 6. Emit RollupFinalized event with finalized index and roots
    }

    function submitFraudProof(
        uint256 _index,
        AccountState memory _initialState,
        bytes32[] memory _stateProof,
        Transaction[] memory _txs,
        AccountState memory _afterState,
        bytes32[] memory _finalStateProof
    ) external {
        // 1. Verify the initial account state proof using MerkleProof
        // 2. Calculate the Merkle root of _txs and compare it to the proposed block Merkle root
        // 3. Verify the after state proof using MerkleProof
        // 4. Replay transactions to update the current state
        // 5. Ensure the computed final state matches the provided after state
        // 6. If the final state does not match, invalidate the proposed state
    }

    function calculateTransactionMerkleRoot(
        Transaction[] memory transactions
    ) internal pure returns (bytes32) {
        // 1. If the transactions array is empty, return bytes32(0)
        // 2. Otherwise, hash each transaction and compute the Merkle root
        // 3. Use MerkleProof to calculate the Merkle root from the hashed transactions
    }

    function invalidateProposedState(uint256 _index) internal {
        // 1. Get the RollupState to invalidate from the proposed array
        // 2. Remove the RollupState by shifting the remaining elements and popping the last one
        // 3. Emit RollupInvalidated event with index and roots
    }

    function getProposedLength() external view returns (uint256) {
        // 1. Return the length of the proposed array
    }

    function getFinalizedLength() external view returns (uint256) {
        // 1. Return the length of the finalized array
    }
}
