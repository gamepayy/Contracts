import { ethers, upgrades } from "hardhat";
import { expect } from "chai";
import { StandardMerkleTree } from "@openzeppelin/merkle-tree";

describe("Rewards", () => {
    let gpCore : ethers.Contract;
    let signers: ethers.Signer[];
    let deployer: any;
    let mockOracle: ethers.Contract;
    let mockERC20: ethers.Contract;
    let mockERC20_2: ethers.Contract;
    let tree;
    let root;
    let proofZero;
    let proofOne;

    const rewardsAdminRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("REWARDS_ADMIN_ROLE"));
    const amountZero = 5000;
    const amountOne = 2500;

    beforeEach(async () => {

        signers = await ethers.getSigners();
        deployer = signers[0];
        const GpCoreFactory = await ethers.getContractFactory("GPCore");
        gpCore = await upgrades.deployProxy(GpCoreFactory, {});
        await gpCore.deployed();

        const MockERC20Factory = await ethers.getContractFactory("MintableERC20");
        mockERC20 = await MockERC20Factory.deploy("Mock ERC20", "MERC20", 18);
        await mockERC20.deployed();

        mockERC20_2 = await MockERC20Factory.deploy("Mock ERC20 v2", "MERC20V2", 18);
        await mockERC20_2.deployed();

        await mockERC20.mint(ethers.utils.parseEther("10000"));
        await mockERC20.transfer(gpCore.address, ethers.utils.parseEther("10000"));
        await mockERC20_2.mint(ethers.utils.parseEther("10000"));
        await mockERC20_2.transfer(gpCore.address, ethers.utils.parseEther("10000"));

        const values = [
            [signers[1].address, mockERC20.address, amountZero],
            [signers[2].address, mockERC20_2.address, amountOne]
          ];
    
        const tree = StandardMerkleTree.of(values, ["address", "address", "uint256"]);
    
        root = tree.root;
        proofZero = tree.getProof(0);
        proofOne = tree.getProof(1);

    });
  
    describe ("Rewards deployment", () => {

        it("Should deploy rewards from deployer account", async () => {

            const initialLatestRewards = await gpCore.latestRewards();

            await gpCore.connect(deployer).deployRewards(root);

            const latestRewards = await gpCore.latestRewards();

            expect(latestRewards).to.greaterThan(initialLatestRewards);
            expect(await gpCore.rootHashes(latestRewards)).to.equal(root);
        });

        it("Should deploy rewards from rewards admin account", async () => {

            await gpCore.connect(deployer).grantRole(rewardsAdminRole, signers[1].address);

            const initialLatestRewards = await gpCore.latestRewards();
            
            await gpCore.connect(signers[1]).deployRewards(root);

            const latestRewards = await gpCore.latestRewards();

            expect(latestRewards).to.greaterThan(initialLatestRewards);
            expect(await gpCore.rootHashes(latestRewards)).to.equal(root);
        });

        it("Should deploy rewards after periodicity", async () => {

            const periodicity = await gpCore.periodicity();
            await gpCore.connect(deployer).deployRewards(root);

            await ethers.provider.send("evm_increaseTime", [periodicity.toNumber() + 1]);
            await ethers.provider.send("evm_mine", []);

            const initialLatestRewards = await gpCore.latestRewards();

            await gpCore.connect(deployer).deployRewards(root);

            const latestRewards = await gpCore.latestRewards();

            expect(latestRewards).to.greaterThan(initialLatestRewards);
            expect(await gpCore.rootHashes(latestRewards)).to.equal(root);
        });

        it("Should throw error if attempt to deploy rewards before periodicity", async () => {
                
            await gpCore.connect(deployer).deployRewards(root);
    
            await expect(gpCore.connect(deployer).deployRewards(root)).to.be.revertedWithCustomError(gpCore, "REWARDS_TOO_FAST");
        });
    
        it("Should throw error from non rewards admin account", async () => {
            const error = "AccessControl: account " + signers[1].address.toLowerCase() + " is missing role " + rewardsAdminRole
            await expect(gpCore.connect(signers[1]).deployRewards(root)).to.be.revertedWith(error);
        });
    });

    describe ("Modify periodicity", () => {

        it("Should change periodicity from deployer account", async () => {
            
            const initialPeriodicity = await gpCore.periodicity();

            await gpCore.connect(deployer).changePeriodicity(100);

            const periodicity = await gpCore.periodicity();

            expect(periodicity).to.equal(100);
            expect(periodicity).to.not.equal(initialPeriodicity);
        });

        it("Should change periodicity from rewards admin account", async () => {

            await gpCore.connect(deployer).grantRole(rewardsAdminRole, signers[1].address);
            const initialPeriodicity = await gpCore.periodicity();

            await gpCore.connect(signers[1]).changePeriodicity(100);

            const periodicity = await gpCore.periodicity();

            expect(periodicity).to.equal(100);
            expect(periodicity).to.not.equal(initialPeriodicity);
        });

        it("Should throw error from non rewards admin account", async () => {

            const error = "AccessControl: account " + signers[1].address.toLowerCase() + " is missing role " + rewardsAdminRole
            await expect(gpCore.connect(signers[1]).changePeriodicity(100)).to.be.revertedWith(error);
        });
    
    });

    describe ("Claim rewards", () => {

        let latestRewards;

        beforeEach(async () => {

            const initialLatestRewards = await gpCore.latestRewards();

            await gpCore.connect(deployer).deployRewards(root);

            latestRewards = await gpCore.latestRewards();
    
        });
        
        it("Should claim eth rewards ", async () => {

            await deployer.sendTransaction({to: gpCore.address, value: ethers.utils.parseEther("100")});
            const values2 = [
                [signers[3].address, ethers.constants.AddressZero, ethers.utils.parseEther("1")]
              ];
        
            const tree2 = StandardMerkleTree.of(values2, ["address", "address", "uint256"]);
        
            const root2 = tree2.root;
            const proofZero2 = tree2.getProof(0);

            const periodicity = await gpCore.periodicity();

            await ethers.provider.send("evm_increaseTime", [periodicity.toNumber() + 1]);
            await ethers.provider.send("evm_mine", []);

            await gpCore.connect(deployer).deployRewards(root2);
            const latestRewards = await gpCore.latestRewards();

            const initialBalanceZero =  await ethers.provider.getBalance(signers[3].address);

            await gpCore.connect(signers[3]).claimRewards(latestRewards, root2, proofZero2, ethers.constants.AddressZero, ethers.utils.parseEther("1"));

            const finalBalanceZero =  await ethers.provider.getBalance(signers[3].address);

            expect(finalBalanceZero).to.closeTo(initialBalanceZero.add(ethers.utils.parseEther("1")), ethers.utils.parseEther("0.1"));

        });

        it("Should claim erc20 rewards ", async () => {

            const initialBalanceZero =  await mockERC20.balanceOf(signers[1].address);

            await gpCore.connect(signers[1]).claimRewards(latestRewards, root, proofZero, mockERC20.address, amountZero);
            
            const finalBalanceZero =  await mockERC20.balanceOf(signers[1].address);
            expect(finalBalanceZero).to.equal(initialBalanceZero.add(amountZero));

            const initialBalanceOne =  await mockERC20_2.balanceOf(signers[2].address);

            await gpCore.connect(signers[2]).claimRewards(latestRewards, root, proofOne, mockERC20_2.address, amountOne);

            const finalBalanceOne =  await mockERC20_2.balanceOf(signers[2].address);
            expect(finalBalanceOne).to.equal(initialBalanceOne.add(amountOne));
           
        });

        it("Should throw error when root hash if invalid", async () => {

            const values2 = [
                [signers[3].address, mockERC20.address, amountZero],
                [signers[4].address, mockERC20_2.address, amountOne]
              ];
        
            const tree2 = StandardMerkleTree.of(values2, ["address", "address", "uint256"]);
        
            const root2 = tree2.root;

            await expect(gpCore.connect(signers[1]).claimRewards(latestRewards, root2, proofZero, mockERC20.address, amountZero)).to.be.revertedWithCustomError(gpCore, "INVALID_ROOT_HASH");
        });
        
        it("Should throw error when proof if invalid", async () => {
            await expect(gpCore.connect(signers[1]).claimRewards(latestRewards, root, proofOne, mockERC20.address, amountZero)).to.be.revertedWithCustomError(gpCore, "INVALID_PROOF");
        });

        it("Should throw error when reward has already been claimed", async () => {
            const initialBalanceZero =  await mockERC20.balanceOf(signers[1].address);

            await gpCore.connect(signers[1]).claimRewards(latestRewards, root, proofZero, mockERC20.address, amountZero);
            
            const finalBalanceZero =  await mockERC20.balanceOf(signers[1].address);
            expect(finalBalanceZero).to.equal(initialBalanceZero.add(amountZero));

            await expect(gpCore.connect(signers[1]).claimRewards(latestRewards, root, proofZero, mockERC20.address, amountZero)).to.be.revertedWithCustomError(gpCore, "ALREADY_CLAIMED");
        });
        
    });

});