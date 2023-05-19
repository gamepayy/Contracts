import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { ethers } from "ethers";
import { abi } from "../artifacts/contracts/GPCore.sol/GPCore.json";

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

const insertMerkleTree= async (tree: StandardMerkleTree<any>, values: any[]) => {
  const connection = mysql.createConnection(process.env.DATABASE_URL)

  let query = 'INSERT INTO merkle_trees (root, proof, address, token_address, amount) VALUES'

  let parameters: any[] = []
  let argumentsPerRow = 5

  let succesfulWithdrawals: any[] = []

  for (let i=0; i < values.length; i++) {
    
    const verify = StandardMerkleTree.verify(tree.root, ['address', 'address', 'uint256'], values[i], tree.getProof(i));

    if(verify){
      
      query += "(?, ?, ?, ?, ?),"
      parameters.push(tree.root, tree.getProof(i), values[i][0], values[i][1], values[i][2])
      succesfulWithdrawals.push(values[i])
      
    }
  }

  const [rows, fields] = await connection.promise().query(query.slice(0, -1), parameters)

  insertIntoMerkleRootAtChain(tree.root)

  updatePendingWithdrawals(connection, succesfulWithdrawals)
   
    
}

const updatePendingWithdrawals = async (connection: any ,withdrawals: PendingWithdrawal[]) => {
  
  for (let i = 0; i < withdrawals.length; i++) {
    const [rows, fields] = await connection.promise().query('UPDATE pending_withdrawals SET pending = 0 WHERE pending = 1, address = ?, token_address = ?, amount = ?', [withdrawals[i].address, withdrawals[i].token_address, withdrawals[i].amount])
  }
  return true
}

const insertIntoMerkleRootAtChain = async (root: string) => {

  const provider = new ethers.providers.AlchemyProvider('matic', process.env.ALCHEMY_API_KEY)

  const wallet = new ethers.Wallet(process.env.REWARDS_ADMIN_PRIVATE_KEY as string, provider)

  const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS as string, abi, wallet)

  let tx = await contract.deployRewards(root)
  tx = await tx.wait()

  console.log("Succesfully inserted the merkle root at the following transaction: ", tx)

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

    insertMerkleTree(tree, values)
    console.log(tree);

    console.log(tree.render())
      
};

main();