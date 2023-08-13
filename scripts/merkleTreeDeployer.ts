import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { ethers } from "ethers";
import { abi } from "../artifacts/contracts/GPCore.sol/GPCore.json";
import fs from 'fs';
import path from 'path';

const mysql = require('mysql2');
require('dotenv').config();

type PendingWithdrawal = {
  address: string,
  token_address: string,
  amount: string,
};

const fetchPendingWithdrawals = async (connection: any, table: string) => {
  const [rows, fields] = await connection.promise().query(`SELECT * FROM ${table}`);
  return rows;
};

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
  await insertIntoMerkleRootAtChain(tree.root);};

const resetPendingWithdrawals = async (connection: any, withdrawals: PendingWithdrawal[], tableName: string) => {
    for (let i = 0; i < withdrawals.length; i++) {
        const [rows, fields] = await connection.promise().query(`UPDATE ${tableName} SET pending = true WHERE pending = false AND address = ? AND token_address = ? AND amount = ?`, [withdrawals[i].address, withdrawals[i].token_address, parseInt(withdrawals[i].amount)])
      }
      return true
};

const insertIntoMerkleRootAtChain = async (root: string) => {
    const provider = new ethers.providers.AlchemyProvider('maticmum', process.env.ALCHEMY_API_KEY)

    const wallet = new ethers.Wallet(process.env.REWARDS_ADMIN_PRIVATE_KEY as string, provider)
  
    const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS as string, abi, wallet)
  
    let tx = await contract.deployRewards(root, {gasLimit: 2500000})
    tx = await tx.wait()
  
    console.log("Successfully inserted the merkle root at the following transaction: ", tx)
  
};

function isPowerOfTwo(n: number): boolean {
    return n && (n & (n - 1)) === 0;
}

const TIMESTAMP_FILE = path.join(__dirname, 'lastInsertionTimestamp.txt');

const getLastInsertionTime = (): Date | null => {
  if (fs.existsSync(TIMESTAMP_FILE)) {
    const timestamp = fs.readFileSync(TIMESTAMP_FILE, 'utf8');
    return new Date(timestamp);
  }
  return null;
};

const updateLastInsertionTime = (timestamp: Date) => {
  fs.writeFileSync(TIMESTAMP_FILE, timestamp.toISOString());
};

const monitorAndInsertMerkleTree = async (connection: any) => {
  const lastInsertionTime = getLastInsertionTime();
  const currentTime = new Date().getTime();
  const twelveHours = 12 * 60 * 60 * 1000; // 12 hours in milliseconds

  if (!lastInsertionTime || (currentTime - lastInsertionTime.getTime() >= twelveHours)) {
    console.log("12 hours have passed since the last Merkle tree insertion. Inserting a new balanced tree...");

    let values: any[] = [];
    const pendingWithdrawals = await fetchPendingWithdrawals(connection, "pending_withdrawals");
    for (let i = 0; i < pendingWithdrawals.length; i++) {
        if(pendingWithdrawals[i].pending == 1){
          const value = [pendingWithdrawals[i].address, pendingWithdrawals[i].token_address, pendingWithdrawals[i].amount]
    
          values.push(value)
        }
      }

    if (isPowerOfTwo(values.length)) {

      const tree = StandardMerkleTree.of(values, ["address", "address", "uint256"]);
      insertMerkleTree(connection, tree, values);
      updateLastInsertionTime(new Date());
    } else {
      console.log("The number of entries is not a power of 2. Inserting the largest possible balanced Merkle tree...");

      // Find the largest power of two less than values.length
      let largestPowerOfTwo = 1;
      while (largestPowerOfTwo * 2 <= values.length) {
        largestPowerOfTwo *= 2;
      }

      // Use only the first 'largestPowerOfTwo' entries for the Merkle tree
      const balancedWithdrawals = values.slice(0, largestPowerOfTwo);
      const tree = StandardMerkleTree.of(balancedWithdrawals, ["address", "address", "uint256"]);
      // ... [Your logic to generate and insert the Merkle tree using balancedWithdrawals]
      insertMerkleTree(connection, tree, balancedWithdrawals);
      updateLastInsertionTime(new Date());

      console.log(`Inserted a Merkle tree with ${largestPowerOfTwo} entries. Some transactions are missing.`);
    }
  }
};

// Set an interval to run the monitor function every hour (or any desired frequency)
setInterval(() => {
  const connection = mysql.createConnection(process.env.DATABASE_URL);
  monitorAndInsertMerkleTree(connection);
}, 60 * 60 * 1000); // 1 hour in milliseconds

export { fetchPendingWithdrawals, insertMerkleTree, resetPendingWithdrawals, insertIntoMerkleRootAtChain, processPendingWithdrawals };
