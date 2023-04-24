import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

// Utilizes https://github.com/OpenZeppelin/merkle-tree to generate Merkle Trees.

const main = async () => {

    const values = [
        ["0x1111111111111111111111111111111111111111", "5000000000000000000"],
        ["0x2222222222222222222222222222222222222222", "2500000000000000000"]
      ];

    const tree = StandardMerkleTree.of(values, ["address", "uint256"]);

    const root = tree.root;
    const proofZero = tree.getProof(0);
    const proofOne = tree.getProof(1);
    
    const verified = StandardMerkleTree.verify(root, ['address', 'uint'], values[0], proofZero);
    console.log(verified); // TRUE

    const verified2 = StandardMerkleTree.verify(root, ['address', 'uint'], values[1], proofOne);
    console.log(verified2); // TRUE

    const verified3 = StandardMerkleTree.verify(root, ['address', 'uint'], values[0], proofOne);
    console.log(verified3); // FALSE

    console.log(tree);

    console.log(tree.render())
      
};

main();