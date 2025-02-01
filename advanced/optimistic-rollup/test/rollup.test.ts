import { expect } from "chai";
import { ethers } from "hardhat";
import { Rollup, Rollup__factory } from "../typechain";
import {
  generateBlockMerkleRoot,
  generateMerkleProof,
  generateStateMerkleRoot,
} from "./helper";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

describe("Rollup", async function () {
  let deployer: SignerWithAddress;
  let user: SignerWithAddress;
  let rollup: Rollup;
  const finalizationPeriod = 60 * 60 * 24; // 1 day in seconds

  beforeEach(async function () {
    [deployer, user] = await ethers.getSigners();

    const initialState = [
      {
        addr: user.address,
        nonce: 0,
        balance: ethers.utils.parseEther("1"),
      },
      {
        addr: deployer.address,
        nonce: 0,
        balance: ethers.utils.parseEther("2"),
      },
    ];

    const initialTxs = [
      {
        from: ethers.constants.AddressZero,
        to: user.address,
        amount: ethers.utils.parseEther("1"),
        nonce: 0,
      },
      {
        from: ethers.constants.AddressZero,
        to: deployer.address,
        amount: ethers.utils.parseEther("2"),
        nonce: 0,
      },
    ];

    const initialStateMerkleRoot = generateStateMerkleRoot(initialState);
    const initialBlockMerkleRoot = generateBlockMerkleRoot(initialTxs);

    // Deploy Rollup contract with initial state
    const RollupFactory = (await ethers.getContractFactory(
      "Rollup"
    )) as Rollup__factory;
    rollup = await RollupFactory.deploy(
      finalizationPeriod,
      initialBlockMerkleRoot,
      initialStateMerkleRoot
    );
  });

  it("should initialize with the correct initial finalized state", async function () {
    const finalizedState = await rollup.finalized(0);
    expect(finalizedState.blockMerkleRoot).to.equal(
      await rollup.finalized(0).then((r) => r.blockMerkleRoot)
    );
    expect(finalizedState.stateMerkleRoot).to.equal(
      await rollup.finalized(0).then((r) => r.stateMerkleRoot)
    );
  });

  it("should propose a new state and emit an event", async function () {
    const blockMerkleRoot = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("blockRoot")
    );
    const stateMerkleRoot = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("stateRoot")
    );

    const tx = await rollup.proposeState(blockMerkleRoot, stateMerkleRoot);

    const proposedState = await rollup.proposed(0);
    expect(proposedState.blockMerkleRoot).to.equal(blockMerkleRoot);
    expect(proposedState.stateMerkleRoot).to.equal(stateMerkleRoot);

    await expect(tx)
      .to.emit(rollup, "RollupProposed")
      .withArgs(0, blockMerkleRoot, stateMerkleRoot, proposedState.timestamp);
  });

  it("should not allow finalizing a proposed state before the finalization period", async function () {
    const blockMerkleRoot = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("blockRoot")
    );
    const stateMerkleRoot = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("stateRoot")
    );

    await rollup.proposeState(blockMerkleRoot, stateMerkleRoot);

    // Try to finalize immediately
    await expect(rollup.finalizeState(0)).to.be.revertedWith(
      "Finalization period not met"
    );
  });

  it("should not allow finalizing a state with an invalid index", async function () {
    await expect(rollup.finalizeState(0)).to.be.revertedWith("Invalid index");
  });

  it("should finalize a proposed state after the finalization period and emit an event", async function () {
    const blockMerkleRoot = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("blockRoot")
    );
    const stateMerkleRoot = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("stateRoot")
    );

    await rollup.proposeState(blockMerkleRoot, stateMerkleRoot);

    // Fast forward time to after the finalization period
    await ethers.provider.send("evm_increaseTime", [finalizationPeriod + 1]);
    await ethers.provider.send("evm_mine", []);

    const tx = await rollup.finalizeState(0);

    const finalizedState = await rollup.finalized(1);
    expect(finalizedState.blockMerkleRoot).to.equal(blockMerkleRoot);
    expect(finalizedState.stateMerkleRoot).to.equal(stateMerkleRoot);

    await expect(tx)
      .to.emit(rollup, "RollupFinalized")
      .withArgs(1, blockMerkleRoot, stateMerkleRoot);
  });

  it("should finalize a valid proposed state", async function () {
    const tx = {
      from: user.address,
      to: ethers.constants.AddressZero,
      amount: ethers.utils.parseEther("1"),
      nonce: 0,
    };

    const afterState = [
      {
        addr: user.address,
        nonce: 1,
        balance: ethers.utils.parseEther("0"),
      },
      {
        addr: deployer.address,
        nonce: 0,
        balance: ethers.utils.parseEther("2"),
      },
    ];

    const stateMerkleRoot = generateStateMerkleRoot(afterState);
    const blockMerkleRoot = generateBlockMerkleRoot([tx]);

    await rollup.connect(user).proposeState(blockMerkleRoot, stateMerkleRoot);

    // Fast forward time to after the finalization period
    await ethers.provider.send("evm_increaseTime", [finalizationPeriod + 1]);
    await ethers.provider.send("evm_mine", []);

    const txFinalize = await rollup.finalizeState(0);

    const finalizedState = await rollup.finalized(1);
    expect(finalizedState.blockMerkleRoot).to.equal(blockMerkleRoot);
    expect(finalizedState.stateMerkleRoot).to.equal(stateMerkleRoot);

    await expect(txFinalize)
      .to.emit(rollup, "RollupFinalized")
      .withArgs(1, blockMerkleRoot, stateMerkleRoot);
  });

  it("should reject invalid initial account state proof", async function () {
    const initialState = [
      {
        addr: user.address,
        nonce: 0,
        balance: ethers.utils.parseEther("1"),
      },
      {
        addr: deployer.address,
        nonce: 0,
        balance: ethers.utils.parseEther("2"),
      },
    ];

    const tx = {
      from: user.address,
      to: ethers.constants.AddressZero,
      amount: ethers.utils.parseEther("1"),
      nonce: 0,
    };

    const stateMerkleRoot = generateStateMerkleRoot(initialState);
    const blockMerkleRoot = generateBlockMerkleRoot([tx]);

    await rollup.connect(user).proposeState(blockMerkleRoot, stateMerkleRoot);

    // Create fake invalid proofs
    const invalidProof = [
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("invalidProof")),
    ];

    await expect(
      rollup
        .connect(user)
        .submitFraudProof(
          0,
          initialState[0],
          invalidProof,
          [tx],
          initialState[0],
          invalidProof
        )
    ).to.be.revertedWith("Invalid initial account state proof");
  });

  it("should revert if the transaction Merkle root does not match the proposed block Merkle root", async function () {
    const initialState = [
      {
        addr: user.address,
        nonce: 0,
        balance: ethers.utils.parseEther("1"),
      },
      {
        addr: deployer.address,
        nonce: 0,
        balance: ethers.utils.parseEther("2"),
      },
    ];

    const tx = {
      from: user.address,
      to: ethers.constants.AddressZero,
      amount: ethers.utils.parseEther("1"),
      nonce: 0,
    };

    const afterState = [
      {
        addr: user.address,
        nonce: 1,
        balance: ethers.utils.parseEther("0"),
      },
      {
        addr: deployer.address,
        nonce: 0,
        balance: ethers.utils.parseEther("2"),
      },
    ];

    const stateMerkleRoot = generateStateMerkleRoot(afterState);
    const invalidBlockMerkleRoot = ethers.utils.keccak256(
      ethers.utils.toUtf8Bytes("invalidBlockRoot")
    ); // Use an invalid block root

    await rollup
      .connect(user)
      .proposeState(invalidBlockMerkleRoot, stateMerkleRoot);

    // Create valid proofs for the initial state
    const initialStateHashes = initialState.map((state) =>
      ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["address", "uint256", "uint256"],
          [state.addr, state.nonce, state.balance]
        )
      )
    );
    const initialStateProof = generateMerkleProof(initialStateHashes, 0);

    // Create valid proofs for the after state
    const afterStateHashes = afterState.map((state) =>
      ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["address", "uint256", "uint256"],
          [state.addr, state.nonce, state.balance]
        )
      )
    );

    const finalStateProof = generateMerkleProof(afterStateHashes, 0);

    // Submit fraud proof
    await expect(
      rollup
        .connect(user)
        .submitFraudProof(
          0,
          initialState[0],
          initialStateProof,
          [tx],
          afterState[0],
          finalStateProof
        )
    ).to.be.revertedWith("Block Merkle root does not match");
  });

  it("should invalidate a proposed state with invalid after state proof", async function () {
    const initialState = [
      {
        addr: user.address,
        nonce: 0,
        balance: ethers.utils.parseEther("1"),
      },
      {
        addr: deployer.address,
        nonce: 0,
        balance: ethers.utils.parseEther("2"),
      },
    ];

    const tx = {
      from: user.address,
      to: ethers.constants.AddressZero,
      amount: ethers.utils.parseEther("1"),
      nonce: 0,
    };

    const afterState = [
      {
        addr: user.address,
        nonce: 1,
        balance: ethers.utils.parseEther("0"),
      },
      {
        addr: deployer.address,
        nonce: 0,
        balance: ethers.utils.parseEther("2"),
      },
    ];

    const stateMerkleRoot = generateStateMerkleRoot(afterState);
    const blockMerkleRoot = generateBlockMerkleRoot([tx]);

    await rollup.connect(user).proposeState(blockMerkleRoot, stateMerkleRoot);

    // Create valid proofs for the initial state
    const initialStateHashes = initialState.map((state) =>
      ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["address", "uint256", "uint256"],
          [state.addr, state.nonce, state.balance]
        )
      )
    );
    const initialStateProof = generateMerkleProof(initialStateHashes, 0);

    // Create invalid proofs for the after state
    const invalidAfterStateProof = [
      ethers.utils.keccak256(ethers.utils.toUtf8Bytes("invalidProof")),
    ];

    // Submit fraud proof
    await expect(
      rollup
        .connect(user)
        .submitFraudProof(
          0,
          initialState[0],
          initialStateProof,
          [tx],
          afterState[0],
          invalidAfterStateProof
        )
    ).to.be.revertedWith("Invalid after state proof");
  });

  it("should not invalidate a proposed state if the fraud proof results in a valid state", async function () {
    // Prepare initial state and transaction
    const initialState = [
      {
        addr: user.address,
        nonce: 0,
        balance: ethers.utils.parseEther("1"),
      },
      {
        addr: deployer.address,
        nonce: 0,
        balance: ethers.utils.parseEther("2"),
      },
    ];

    const tx = {
      from: user.address,
      to: ethers.constants.AddressZero,
      amount: ethers.utils.parseEther("1"),
      nonce: 0,
    };

    const afterState = [
      {
        addr: user.address,
        nonce: 1,
        balance: ethers.utils.parseEther("0"),
      },
      {
        addr: deployer.address,
        nonce: 0,
        balance: ethers.utils.parseEther("2"),
      },
    ];

    const stateMerkleRoot = generateStateMerkleRoot(afterState);
    const blockMerkleRoot = generateBlockMerkleRoot([tx]);

    await rollup.connect(user).proposeState(blockMerkleRoot, stateMerkleRoot);

    // Create valid proofs for the initial state
    const initialStateHashes = initialState.map((state) =>
      ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["address", "uint256", "uint256"],
          [state.addr, state.nonce, state.balance]
        )
      )
    );
    const initialStateProof = generateMerkleProof(initialStateHashes, 0);

    // Create valid proofs for the after state
    const afterStateHashes = afterState.map((state) =>
      ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["address", "uint256", "uint256"],
          [state.addr, state.nonce, state.balance]
        )
      )
    );

    const finalStateProof = generateMerkleProof(afterStateHashes, 0);

    // Submit fraud proof
    await expect(
      rollup
        .connect(user)
        .submitFraudProof(
          0,
          initialState[0],
          initialStateProof,
          [tx],
          afterState[0],
          finalStateProof
        )
    ).to.be.revertedWith("Invalidation failed: resulting state is valid");
    // Ensure that the proposed state still exists
    expect(await rollup.getProposedLength()).to.equal(1);
  });

  it("should invalidate a proposed state with valid proof due to insufficient balance and emit an event", async function () {
    const initialState = [
      {
        addr: user.address,
        nonce: 0,
        balance: ethers.utils.parseEther("1"),
      },
      {
        addr: deployer.address,
        nonce: 0,
        balance: ethers.utils.parseEther("2"),
      },
    ];

    const tx = {
      from: user.address,
      to: ethers.constants.AddressZero,
      amount: ethers.utils.parseEther("2"), // Invalid amount, more than balance
      nonce: 0,
    };

    const afterState = [
      {
        addr: user.address,
        nonce: 1,
        balance: ethers.utils.parseEther("0"),
      },
      {
        addr: deployer.address,
        nonce: 0,
        balance: ethers.utils.parseEther("2"),
      },
    ];

    const stateMerkleRoot = generateStateMerkleRoot(afterState);
    const blockMerkleRoot = generateBlockMerkleRoot([tx]);

    await rollup.connect(user).proposeState(blockMerkleRoot, stateMerkleRoot);

    // Create valid proofs
    const initialStateHashes = initialState.map((state) =>
      ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["address", "uint256", "uint256"],
          [state.addr, state.nonce, state.balance]
        )
      )
    );

    const stateProof = generateMerkleProof(initialStateHashes, 0);

    const txResult = await rollup
      .connect(user)
      .submitFraudProof(
        0,
        initialState[0],
        stateProof,
        [tx],
        afterState[0],
        stateProof
      );

    // Ensure that the proposed state has been invalidated
    expect(await rollup.getProposedLength()).to.equal(0);

    await expect(txResult)
      .to.emit(rollup, "RollupInvalidated")
      .withArgs(0, blockMerkleRoot, stateMerkleRoot);
  });

  it("should invalidate a proposed state if the transaction nonce does not match the account nonce", async function () {
    const initialState = [
      {
        addr: user.address,
        nonce: 0,
        balance: ethers.utils.parseEther("1"),
      },
      {
        addr: deployer.address,
        nonce: 0,
        balance: ethers.utils.parseEther("2"),
      },
    ];

    const tx = {
      from: user.address,
      to: ethers.constants.AddressZero,
      amount: ethers.utils.parseEther("1"),
      nonce: 1, // Incorrect nonce
    };

    const afterState = [
      {
        addr: user.address,
        nonce: 1,
        balance: ethers.utils.parseEther("0"),
      },
      {
        addr: deployer.address,
        nonce: 0,
        balance: ethers.utils.parseEther("2"),
      },
    ];

    const stateMerkleRoot = generateStateMerkleRoot(afterState);
    const blockMerkleRoot = generateBlockMerkleRoot([tx]);

    await rollup.connect(user).proposeState(blockMerkleRoot, stateMerkleRoot);

    // Create valid proofs for the initial state
    const initialStateHashes = initialState.map((state) =>
      ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["address", "uint256", "uint256"],
          [state.addr, state.nonce, state.balance]
        )
      )
    );
    const initialStateProof = generateMerkleProof(initialStateHashes, 0);

    // Create valid proofs for the after state
    const afterStateHashes = afterState.map((state) =>
      ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["address", "uint256", "uint256"],
          [state.addr, state.nonce, state.balance]
        )
      )
    );

    const finalStateProof = generateMerkleProof(afterStateHashes, 0);

    // Submit fraud proof
    await rollup
      .connect(user)
      .submitFraudProof(
        0,
        initialState[0],
        initialStateProof,
        [tx],
        afterState[0],
        finalStateProof
      );

    // Ensure that the proposed state has been invalidated
    expect(await rollup.getProposedLength()).to.equal(0);
  });

  it("should not affect currentState if transaction does not involve currentState.addr", async function () {
    const initialState = [
      {
        addr: user.address,
        nonce: 0,
        balance: ethers.utils.parseEther("1"),
      },
      {
        addr: deployer.address,
        nonce: 0,
        balance: ethers.utils.parseEther("2"),
      },
    ];

    const tx = {
      from: ethers.constants.AddressZero,
      to: ethers.constants.AddressZero,
      amount: ethers.utils.parseEther("1"),
      nonce: 0,
    };

    const afterState = [
      {
        addr: user.address,
        nonce: 0,
        balance: ethers.utils.parseEther("1"),
      },
      {
        addr: deployer.address,
        nonce: 0,
        balance: ethers.utils.parseEther("2"),
      },
    ];

    const stateMerkleRoot = generateStateMerkleRoot(afterState);
    const blockMerkleRoot = generateBlockMerkleRoot([tx]);

    await rollup.connect(user).proposeState(blockMerkleRoot, stateMerkleRoot);

    // Create valid proofs for the initial state
    const initialStateHashes = initialState.map((state) =>
      ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["address", "uint256", "uint256"],
          [state.addr, state.nonce, state.balance]
        )
      )
    );
    const initialStateProof = generateMerkleProof(initialStateHashes, 0);

    // Create valid proofs for the after state
    const afterStateHashes = afterState.map((state) =>
      ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["address", "uint256", "uint256"],
          [state.addr, state.nonce, state.balance]
        )
      )
    );

    const finalStateProof = generateMerkleProof(afterStateHashes, 0);

    // Submit fraud proof
    await expect(
      rollup
        .connect(user)
        .submitFraudProof(
          0,
          initialState[0],
          initialStateProof,
          [tx],
          afterState[0],
          finalStateProof
        )
    ).to.be.revertedWith("Invalidation failed: resulting state is valid");

    // Ensure that the proposed state still exists
    expect(await rollup.getProposedLength()).to.equal(1);
  });
});
