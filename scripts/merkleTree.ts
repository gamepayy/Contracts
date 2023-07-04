import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { ethers } from "ethers";
import { abi } from "../artifacts/contracts/GPCore.sol/GPCore.json";

const mysql = require('mysql2')

require('dotenv').config()

type PendingWithdrawal = {
  address: string,
  token_address: string,
  amount: string,
}

const fetchPendingWithdrawals = async (connection: any, table: string) => {
  
  const [rows, fields] = await connection.promise().query(`SELECT * FROM ${table}`)
  return rows
}

const processPendingWithdrawals = async (connection: any, tableName: string, ids: number[]) => {
  // Transform ids array to a string of comma-separated values
  const idsString = ids.join(', ');

  const query = `UPDATE ${tableName} SET pending = false WHERE id IN (${idsString})`;

  // execute the query
  const [rows2, fields2] = await connection.promise().query(query);

  return true;
}


const insertMerkleTree = async (connection: any, tree: StandardMerkleTree<any>, values: any[]) => {
  
  let query = 'INSERT INTO MerkleTrees (root, address, token_address, amount, hash1, hash2, hash3, hash4, hash5, hash6, hash7, hash8, hash9, hash10, hash11, hash12) VALUES';
  let parameters: any[] = [];

  let successfulWithdrawals: any[] = [];

  for (let i=0; i < values.length; i++) {
    
    const verify = StandardMerkleTree.verify(tree.root, ['address', 'address', 'uint256'], values[i], tree.getProof(i));

    if(verify) {
      let proof = tree.getProof(i);
      let hashes = new Array(12).fill(null);

      for (let j = 0; j < proof.length; j++) {
        hashes[j] = proof[j];
      }

      query += "(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?),";
      parameters.push(tree.root, values[i][0], values[i][1], values[i][2], ...hashes);
      successfulWithdrawals.push(values[i]);
    }
  }

  console.log(query.slice(0, -1));
  console.log(parameters);

  const [rows, fields] = await connection.promise().query(query.slice(0, -1), parameters);

  console.log("Successfully inserted the merkle tree into the database!");
  await insertIntoMerkleRootAtChain(tree.root);
  // commented out as this should only be done every 24 hours

}

const resetPendingWithdrawals = async (connection: any, withdrawals: PendingWithdrawal[], tableName: string) => {

  for (let i = 0; i < withdrawals.length; i++) {
    const [rows, fields] = await connection.promise().query(`UPDATE ${tableName} SET pending = true WHERE pending = false AND address = ? AND token_address = ? AND amount = ?`, [withdrawals[i].address, withdrawals[i].token_address, parseInt(withdrawals[i].amount)])
  }
  return true
}

const insertIntoMerkleRootAtChain = async (root: string) => {

  const provider = new ethers.providers.AlchemyProvider('maticmum', process.env.ALCHEMY_API_KEY)

  const wallet = new ethers.Wallet(process.env.REWARDS_ADMIN_PRIVATE_KEY as string, provider)

  const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS as string, abi, wallet)

  let tx = await contract.deployRewards(root, {gasLimit: 2500000})
  tx = await tx.wait()

  console.log("Successfully inserted the merkle root at the following transaction: ", tx)
}

const main = async () => {

  let values: any[] = [];

  const connection = mysql.createConnection(process.env.DATABASE_URL)
  console.log('Connected to PlanetScale!')

  console.log('Fetching pending withdrawals...')
  const pendingWithdrawals = await fetchPendingWithdrawals(connection, "pending_withdrawals");
  console.log(pendingWithdrawals)

  console.log('Generating merkle tree...')
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

    insertMerkleTree(connection, tree, values);
    console.log(tree);

    console.log(tree.render())
};

export { fetchPendingWithdrawals, insertMerkleTree, resetPendingWithdrawals, insertIntoMerkleRootAtChain, processPendingWithdrawals }
