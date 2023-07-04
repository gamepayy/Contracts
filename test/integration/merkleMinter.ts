// this test creates a test table, populates it with data and then puts the merkle root on-chain by running the merkleTree.ts service.
// This test also stores a merkle proof for each specific row in the table.
// Finally it claims all pending rewards for the table and updates it's state.

import { StandardMerkleTree } from "@openzeppelin/merkle-tree";
import { ethers } from "hardhat";
import { expect } from "chai";
import { BigNumber, Contract, Signer } from "ethers";
import { resetPendingWithdrawals, processPendingWithdrawals, insertMerkleTree, fetchPendingWithdrawals } from "../../scripts/merkleTree";
import fs from 'fs';

require('dotenv').config()
const mysql = require('mysql2')
const tableName = 'pending_withdrawals_test'

describe("MerkleMinter", function () {
    let accounts: Signer[];
    let deployer;
    let acc1;
    let acc2;
    let acc3;
    let integrationTestToken: Contract;
    let gpCore: Contract;

    const connection = mysql.createConnection(process.env.DATABASE_URL)
    console.log('Connected to PlanetScale!')

    before(async () => {
        accounts = await ethers.getSigners();
        deployer = accounts[0];
        acc1 = accounts[1];
        acc2 = accounts[2];
        acc3 = accounts[3];

        // check if the test table exists, if not create it

        const [rows, fields] = await connection.promise().query(`CREATE TABLE IF NOT EXISTS ${tableName} (id INT(20) AUTO_INCREMENT, address VARCHAR(255), token_address VARCHAR(255), amount VARCHAR(255), root VARCHAR(255), txHash VARCHAR(255), pending BOOLEAN, PRIMARY KEY (id))`);
        console.log('Table exists or has been created!')

        integrationTestToken = await ethers.getContractAt("IERC20", process.env.INTEGRATION_TEST_TOKEN_ADDRESS as string);
       
        const gpCoreFactory = await ethers.getContractFactory("GPCore");
        gpCore = gpCoreFactory.attach(process.env.GP_CORE_CONTRACT_ADDRESS as string);

        // set all pending withdrawals to 0
        const pendingWithdrawals = await fetchPendingWithdrawals(connection, tableName)
        
        resetPendingWithdrawals(connection, pendingWithdrawals, tableName)
        
        const merkleData = [
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
            [acc1.address, integrationTestToken.address, '100'],
            [acc2.address, integrationTestToken.address, '200'],
            [acc3.address, integrationTestToken.address, '300'],
            [acc1.address, ethers.constants.AddressZero, '100'],
            [acc2.address, ethers.constants.AddressZero, '200'],
            [acc3.address, ethers.constants.AddressZero, '300'],
            [acc1.address, integrationTestToken.address, '1000'],
            [acc2.address, integrationTestToken.address, '2000'],
            [acc3.address, integrationTestToken.address, '3000'],
            [acc1.address, ethers.constants.AddressZero, '1000'],
            [acc2.address, ethers.constants.AddressZero, '2000'],
            [acc3.address, ethers.constants.AddressZero, '3000'],
        ]

        // populate pending_withdrawals_test with merkleData
        let values: any[] = [];
        let commasStructure = '';
        for (let i = 0; i < merkleData.length; i++) {
            // follows the txt model: address, token_address, amount
            const value = [merkleData[i][0], merkleData[i][1], merkleData[i][2], true]
            values = [...values, ...value];
            commasStructure += '(?, ?, ?, ?),'
        }

        // remove the last comma
        commasStructure = commasStructure.slice(0, -1)

        // populate the table with data
        // form the query string
        const query = `INSERT INTO ${tableName} (address, token_address, amount, pending) VALUES ${commasStructure}`;

        // populate the table with data
        const [rows2, fields2] = await connection.promise().query(query, values);
        // now get the data from the table (there are definitely better ways to do this at this context, but this serves as a proof the system works.
        // at the real business usecase, the entries will be generated in much more sparse intervals, so actually this is the reallistic way for
        // it to work)
        const [rows3, fields3] = await connection.promise().query(`SELECT * FROM ${tableName} WHERE pending = true`)
        console.log(rows3)
        // parse this data as [address, token_address, amount]
        const idsToProcess: any = []
        const merkleData2: any = []
        for (let i = 0; i < rows3.length; i++) {
            const value = [rows3[i].address, rows3[i].token_address, rows3[i].amount]
            merkleData2.push(value)
            idsToProcess.push(rows3[i].id)
        }
        
        
        // generate the merkle tree
        const tree = StandardMerkleTree.of(merkleData as any, ["address", "address", "uint256"]);
        // insert the merkle tree into the database
        await insertMerkleTree(connection, tree, merkleData as any)

        // update the pending_withdrawals_test table statuses
        processPendingWithdrawals(connection, tableName, idsToProcess)


    })
    it("should claim one entry", async function() {
        // fetch one entry from the merkle tree table where account = acc1.address
        console.log(acc1.address)
        const [rows, fields] = await connection.promise().query(`SELECT * FROM MerkleTrees WHERE address = "${acc1.address}" AND root = "0xc5f8ecff00b265f16a3f434ba430b62cbf8fa0d295118be5fe33fccef42e873f" LIMIT 1`)
        
        const rootHashId = "1688503630"
        const rootHash = "0xc5f8ecff00b265f16a3f434ba430b62cbf8fa0d295118be5fe33fccef42e873f"
        console.log(rows)
        const hash1 = rows[0].hash1?.toString()
        const hash2 = rows[0].hash2?.toString()
        const hash3 = rows[0].hash3?.toString()
        const hash4 = rows[0].hash4?.toString()
        const hash5 = rows[0].hash5?.toString()
        const hash6 = rows[0].hash6?.toString()
        const hash7 = rows[0].hash7?.toString()
        const hash8 = rows[0].hash8?.toString()
        const hash9 = rows[0].hash9?.toString()
        const hash10 = rows[0].hash10?.toString()
        const hash11 = rows[0].hash11?.toString()
        const hash12 = rows[0].hash12?.toString()

        const proofs: any = []

        for (let i = 0; i < 12; i++) {
            if (rows[0][`hash${i+1}`] != null)
                proofs.push(rows[0][`hash${i+1}`])
        }


        // claim the entry
        const tx = await gpCore.claimRewards(rootHashId, rootHash, proofs, rows[0].token_address, rows[0].amount)
        const receipt = await tx.wait()
        console.log(receipt)

        // update the tables - erase it from the merkle tree table
        await connection.promise().query(`DELETE FROM MerkleTrees WHERE address = ${acc1.address} AND root = "0xc5f8ecff00b265f16a3f434ba430b62cbf8fa0d295118be5fe33fccef42e873f" AND token_address = ${rows[0].token_address} AND amount = ${rows[0].amount}`)
    });
});

    