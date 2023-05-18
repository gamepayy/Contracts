import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
const mysql = require('mysql2')

require('dotenv').config()
// Utilizes https://github.com/OpenZeppelin/merkle-tree to generate Merkle Trees.

type PendingWithdrawal = {
  address: string,
  token_address: string,
  amount: string,
}

const fetchPendingWithdrawals = async () => {
  const connection = mysql.createConnection(process.env.DATABASE_URL)
  const [rows, fields] = await connection.promise().query('SELECT * FROM pending_withdrawals')
  connection.end()
  return rows
}



const main = async () => {

  let values: any[] = []

  const connection = mysql.createConnection(process.env.DATABASE_URL)
  console.log('Connected to PlanetScale!')
  connection.end()

  const pendingWithdrawals = await fetchPendingWithdrawals()
  console.log(pendingWithdrawals)

  for (let i = 0; i < pendingWithdrawals.length; i++) {
    if(pendingWithdrawals[i].pending == 1){
      const value = [pendingWithdrawals[i].address, pendingWithdrawals[i].token_address, pendingWithdrawals[i].amount]
    
      values.push(value)
    }
  }
    const tree = StandardMerkleTree.of(values, ["address", "address", "uint256"]);

    console.log(values)
    const root = tree.root;
    const proofZero = tree.getProof(0);
    const proofOne = tree.getProof(1);
  /*  
    const verified = StandardMerkleTree.verify(root, ['address', 'uint'], values[0], proofZero);
    console.log(verified); // TRUE

    const verified2 = StandardMerkleTree.verify(root, ['address', 'uint'], values[1], proofOne);
    console.log(verified2); // TRUE

    const verified3 = StandardMerkleTree.verify(root, ['address', 'uint'], values[0], proofOne);
    console.log(verified3); // FALSE
*/
    console.log(tree);

    console.log(tree.render())
      
};

main();