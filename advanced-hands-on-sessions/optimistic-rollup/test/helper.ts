import { ethers } from "hardhat";

export function verifyMerkleProof(
  leaf: string,
  proof: string[],
  root: string
): boolean {
  let computedHash = leaf;

  for (const proofElement of proof) {
    if (computedHash < proofElement) {
      computedHash = ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["bytes32", "bytes32"],
          [computedHash, proofElement]
        )
      );
    } else {
      computedHash = ethers.utils.keccak256(
        ethers.utils.solidityPack(
          ["bytes32", "bytes32"],
          [proofElement, computedHash]
        )
      );
    }
  }

  return computedHash === root;
}

export function generateMerkleRoot(elements: string[]): string {
  if (elements.length === 1) {
    return elements[0];
  }

  const newElements: string[] = [];
  for (let i = 0; i < elements.length; i += 2) {
    if (i + 1 < elements.length) {
      const element1 = elements[i];
      const element2 = elements[i + 1];

      // If element1 <= element2, hash as element1 + element2
      // Otherwise, hash as element2 + element1
      if (element1 <= element2) {
        newElements.push(
          ethers.utils.keccak256(
            ethers.utils.solidityPack(
              ["bytes32", "bytes32"],
              [element1, element2]
            )
          )
        );
      } else {
        newElements.push(
          ethers.utils.keccak256(
            ethers.utils.solidityPack(
              ["bytes32", "bytes32"],
              [element2, element1]
            )
          )
        );
      }
    } else {
      newElements.push(elements[i]);
    }
  }

  return generateMerkleRoot(newElements);
}

export function generateStateMerkleRoot(accountStates: any[]): string {
  const leaves = accountStates.map((state) =>
    ethers.utils.keccak256(
      ethers.utils.solidityPack(
        ["address", "uint256", "uint256"],
        [state.addr, state.nonce, state.balance]
      )
    )
  );
  return generateMerkleRoot(leaves);
}

export function generateBlockMerkleRoot(transactions: any[]): string {
  const leaves = transactions.map((tx) =>
    ethers.utils.keccak256(
      ethers.utils.solidityPack(
        ["address", "address", "uint256", "uint256"],
        [tx.from, tx.to, tx.amount, tx.nonce]
      )
    )
  );
  return generateMerkleRoot(leaves);
}

export function generateMerkleProof(
  elements: string[],
  index: number
): string[] {
  let proof: string[] = [];
  let currentIndex = index;
  let currentElements = [...elements];

  while (currentElements.length > 1) {
    const newElements: string[] = [];
    for (let i = 0; i < currentElements.length; i += 2) {
      if (i + 1 < currentElements.length) {
        newElements.push(
          ethers.utils.keccak256(
            ethers.utils.solidityPack(
              ["bytes32", "bytes32"],
              [currentElements[i], currentElements[i + 1]]
            )
          )
        );
        if (i === currentIndex || i + 1 === currentIndex) {
          proof.push(currentElements[i === currentIndex ? i + 1 : i]);
        }
      } else {
        newElements.push(currentElements[i]);
      }
    }
    currentIndex = Math.floor(currentIndex / 2);
    currentElements = newElements;
  }
  return proof;
}
