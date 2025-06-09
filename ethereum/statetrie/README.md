# State Trie Implementation in TypeScript

This Learning Module implements a simplified hexary Merkle Patricia Trie (MPT) for storing Ethereum state data. This is a streamlined version of the full MPT specification - it doesn't include extension nodes or other optimizations found in production implementations.

> **Prerequisites**: To better understand this module, it is recommended to have:
>
> - Basic understanding of hash functions and trees
> - Familiarity with key-value databases
> - Knowledge of Ethereum state storage concepts

<br>

## 1. Overview

Imagine you need to store and verify account balances in a blockchain system. You want to:

- Efficiently store millions of account balances
- Quickly prove a specific account has a certain balance
- Generate a single hash that represents the entire state
- Update individual balances without recalculating everything
- **Maintain historical versions of the state for rollbacks**

This simplified Merkle Patricia Trie (MPT) solves these challenges by organizing data in a tree structure where:

- Each node's location is determined by its key's hash
- The tree has 16 branches at each level (hexary)
- The root hash uniquely identifies the entire state
- Updates only affect nodes along a single path

**Note**: This implementation is simplified compared to Ethereum's full MPT specification. It uses only leaf and branch nodes, without extension nodes or other optimizations.

## 2. Learning Objectives

- Understand how simplified MPTs store and organize key-value data
- Learn the detailed mechanics of insert and get operations
- Explore how cryptographic hashing ensures data integrity
- Grasp the relationship between nodes, paths, and state roots
- **Understand immutable state management and version control**
- **Learn how MPTs enable time-travel debugging and rollbacks**

## 3. Core Components

### 3.1 Node Types

The trie uses two types of nodes:

**Leaf Node**

- Stores actual key-value data
- Contains:
  - Full key (address)
  - Value (balance)
  - Hash of the node

**Branch Node**

- Internal routing node with 16 children (0-F in hex)
- Contains:
  - Up to 16 child pointers (hashes)
  - Hash of the node

### 3.2 Detailed Operation Mechanics

#### 3.2.1 Insert Operation (`set`)

The insert operation follows these detailed steps:

1. **Key Preprocessing**

   - Take the input key (e.g., Ethereum address)
   - Hash it using SHA-256 to get a deterministic path
   - Convert the hash to hexadecimal nibbles (each hex digit = 4 bits)
   - Each nibble (0-15) determines which branch to follow at each level

2. **Tree Traversal**

   - Start from the root (or null for empty tree)
   - For each level, use the corresponding nibble as the branch index
   - Follow existing branches or prepare to create new ones

3. **Node Creation/Update**

   - When reaching the insertion point:
     - Create a new leaf node with the key-value pair
     - Store the leaf node in the database
   - Work backwards up the tree:
     - Create/update branch nodes to point to the new leaf
     - Each branch node gets stored in the database
     - Update parent pointers along the entire path

4. **Root Hash Update**
   - Return the hash of the new root node
   - This hash represents the entire updated state

**Visual Example - Insert Operation**:

Let's trace through inserting address `0x0001` with value `100`:

1. **Hash the key**: `0x0001` → SHA-256 → `4bf5122f344554c53bde2ebb8cd2b7e3d1600ad631c385a5d7cce23c7785459a`
2. **Extract path**: First few nibbles: `4`, `b`, `f`, `5`, `1`, `2`, `2`, `f`, `3`...
3. **Tree construction**:
   ```
   Root (Branch)
   └── [4] → Leaf(key: 0x0001, value: 100)
   ```
4. **Database storage**: Each node (leaf and branch node) gets stored with their hash as the key
5. **Return**: Hash of the root branch node

**Adding a second address** `0x0002` with value `200`:

- Hash: `0x0002` → SHA-256 → `dbc1b4c900ffe48d575b5da5c638040125f65db0fe3e24494b76ea986457d986`
- Path starts with: `d`, `b`, `c`, `1`...
- Since the first nibble `d` is different from `4`, we can directly place the leaf:
  ```
  Root (Branch)
  ├── [4] → Leaf(key: 0x0001, value: 100)
  └── [d] → Leaf(key: 0x0002, value: 200)
  ```

**Adding a third address with similar path** `0x0003` with value `300`:

- Hash: `0x0003` → SHA-256 → `4bf5122f3a4554c53bde2ebb8cd2b7e3d1600ad631c385a5d7cce23c7785459b`
- Path starts with: `4`, `b`, `f`, `5`, `1`, `2`, `2`, `f`, `3`, `a`...
- Notice the path is identical to `0x0001` until `4bf5122f3` (9 nibbles), then diverges at the 10th nibble (`4` vs `a`)
- This creates a deeper tree structure:
  ```
  Root (Branch)
  ├── [4] → Branch
  │   └── [b] → Branch
  │       └── [f] → Branch
  │           └── [5] → Branch
  │               └── [1] → Branch
  │                   └── [2] → Branch
  │                       └── [2] → Branch
  │                           └── [f] → Branch
  │                               └── [3] → Branch
  │                                   ├── [4] → Leaf(key: 0x0001, value: 100)
  │                                   └── [a] → Leaf(key: 0x0003, value: 300)
  └── [d] → Leaf(key: 0x0002, value: 200)
  ```
- The algorithm creates intermediate branch nodes for each shared nibble in the path (`4bf5122f3`)
- Only at the point where paths diverge (10th nibble: `4` vs `a`) do we place the actual leaf nodes

**Parent Branch Update Process**:

When inserting or updating a node, all parent branch nodes must be updated because their hash changes. Here's how the update propagates:

1. **Bottom-up Hash Update**:

   - After creating/updating the leaf node, work backwards up the tree
   - Each branch node's hash depends on its children's hashes
   - When a child changes, the parent's hash must be recalculated

2. **Step-by-step Update Process**:

   ```
   // Example: Updating 0x0001 from value 100 to 150

   Before:
   Root(hash: ABC123) → [4] → Branch(hash: DEF456) → ... → Leaf(0x0001, 100)

   After leaf update:
   1. Create new Leaf(0x0001, 150) with new hash GHI789
   2. Update deepest branch: children[4] = GHI789, recalculate hash → JKL012
   3. Update next branch up: children[b] = JKL012, recalculate hash → MNO345
   4. Continue up the tree until reaching root
   5. Root gets new hash PQR678
   ```

3. **Database Operations**:

   - Each updated branch node is stored in the database with its new hash
   - Old nodes remain in the database (for historical states)
   - Only the new root hash is returned, representing the updated state

4. **Immutability Preservation**:
   - Original tree structure remains intact in the database
   - New tree shares unchanged branches with the old tree
   - Only the path from root to the modified leaf gets new nodes
   - This enables efficient state history and rollbacks

#### 3.2.2 Get Operation (`get`)

The `get` operation retrieves a value from the trie by traversing the tree structure using the key's hash path.

### Algorithm Overview

1. **Path Generation**: Convert the key to a hexadecimal path using SHA-256 hash
2. **Tree Traversal**: Navigate through branch nodes following the path nibbles
3. **Value Retrieval**: Return the value when reaching the correct leaf node

### Step-by-Step Process

1. **Input Validation**:

   ```typescript
   // Handle empty tree case
   if (parent === this.EMPTY_TREE_ROOT) {
     return null;
   }
   ```

2. **Path Generation**:

   ```typescript
   // Convert key to hex path using SHA-256
   const path = this.getHexPath(key);
   // Example: "0x0001" → SHA-256 → "4bf5122f344554c53bde2ebb8cd2b7e3d1600ad631c385a5d7cce23c7785459a"
   // → [4, b, f, 5, 1, 2, 2, f, 3, 4, 4, 5, 5, 4, c, 5, 3, b, d, e, 2, e, b, b, 8, c, d, 2, b, 7, e, 3, d, 1, 6, 0, 0, a, d, 6, 3, 1, c, 3, 8, 5, a, 5, d, 7, c, c, e, 2, 3, c, 7, 7, 8, 5, 4, 5, 9, a]
   ```

3. **Tree Traversal Process**:

   ```
   Looking for key: "0x0001" (path: [4, b, f, 5, 1, 2, 2, f, ...])

   Step 1: Start at Root
   ┌─────────────────┐
   │   Root Branch   │
   │ [0][1][2][3][4] │ ← Check index [4] (first nibble)
   │ [ ][ ][ ][ ][●] │
   └─────────────────┘
                  │
                  ▼

   Step 2: Follow path[0] = 4
   ┌─────────────────┐
   │  Branch Node    │
   │ [a][b][c][d][e] │ ← Check index [b] (second nibble)
   │ [ ][●][ ][ ][ ] │
   └─────────────────┘
                  │
                  ▼

   Step 3: Follow path[1] = b
   ┌─────────────────┐
   │  Branch Node    │
   │ [0][1][2][f][4] │ ← Check index [f] (third nibble)
   │ [ ][ ][ ][●][ ] │
   └─────────────────┘
                  │
                  ▼

   Step 4: Continue until reaching leaf...
   ┌─────────────────┐
   │   Leaf Node     │
   │ key: "0x0001"   │ ← Compare with search key
   │ value: 100      │ ← Return this value if match
   └─────────────────┘
   ```

4. **Decision Points During Traversal**:

   ```
   At each branch node:

   ┌─────────────────┐
   │  Branch Node    │
   │ [0][1][2][3][4] │
   │ [ ][ ][●][ ][ ] │ ← nibble = path[depth]
   └─────────────────┘
            │
            ▼

   Decision Tree:
   ├─ If children[nibble] is null → Return null (key not found)
   ├─ If children[nibble] exists → Continue to child node
   └─ If reached leaf → Check if leaf.key === search_key
   ```

5. **Complete Example - Finding "0x0001"**:

   ```
   Search: get(rootHash, "0x0001")
   Path: [4, b, f, 5, 1, 2, 2, f, ...]

   Traversal:
   Root → children[4] → Branch_A
   Branch_A → children[b] → Branch_B
   Branch_B → children[f] → Branch_C
   Branch_C → children[5] → Branch_D
   ...
   Branch_X → children[a] → Leaf("0x0001", 100)

   Final Check:
   ✓ Leaf.key ("0x0001") === search_key ("0x0001")
   ✓ Return Leaf.value (100)
   ```

6. **Failure Cases**:

   ```
   Case 1: Missing Branch
   Root → children[4] → null
   Result: Return null

   Case 2: Wrong Leaf Key
   ...→ Leaf("0x0002", 200)
   Search key: "0x0001"
   Result: Return null (key mismatch)

   Case 3: Path Exhausted
   Depth >= path.length but still at branch node
   Result: Return null
   ```

## 4. Implementation Details

### 4.1 Core Components

1. **StateTrie Class**

   - Main trie structure implementation
   - Handles node creation, insertion, and retrieval
   - Manages root hash calculation and updates

2. **Node Types**

   - **Branch Node**: Contains 16 children array for hex nibbles
   - **Leaf Node**: Stores key-value pairs at tree endpoints
   - **Extension Node**: Optimizes paths with common prefixes

3. **Key Processing**
   - Converts hex keys to nibble arrays for traversal
   - Handles path compression and decompression
   - Manages key encoding/decoding for storage

### 4.2 Storage and Hashing

1. **Merkle Patricia Structure**

   ```typescript
   // Example node structure
   interface BranchNode {
     children: (Node | null)[]; // 16 children for hex nibbles
     value?: any; // Optional value at this node
   }

   interface LeafNode {
     key: string; // Remaining key path
     value: any; // Stored value
   }
   ```

2. **Hash Calculation**
   - Each node's hash is calculated from its contents
   - Root hash represents entire trie state
   - Changes propagate up to update root hash

### 4.3 Operations

1. **Insert Operation**

   - Traverses trie following key path
   - Creates new nodes as needed
   - Updates parent hashes up to root

2. **Get Operation**
   - Follows nibble path through branch nodes
   - Verifies leaf key matches search key
   - Returns value or null if not found

## 5. Running Tests

1. Install dependencies:

```bash
npm install
```

2. Run tests:

```bash
npm run test
```
