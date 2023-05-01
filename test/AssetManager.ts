import { ethers, upgrades } from "hardhat";
import { expect } from "chai";


describe("Asset Manager", () => {
    let gpCore : ethers.Contract;
    let mockERC20: ethers.Contract;
    let signers: ethers.Signer[];
    let deployer: any;

    const assetManagerRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ASSET_MANAGER_ROLE"));
    
    beforeEach(async () => {

        signers = await ethers.getSigners();
        deployer = signers[0];
        const GpCoreFactory = await ethers.getContractFactory("GPCore");
        gpCore = await upgrades.deployProxy(GpCoreFactory, {});
        await gpCore.deployed();

        const MockERC20Factory = await ethers.getContractFactory("MintableERC20");
        mockERC20 = await MockERC20Factory.deploy("Mock ERC20", "MERC20", 18);
        await mockERC20.deployed();

        expect(await gpCore.isAssetApproved(mockERC20.address)).to.equal(false);

    });
    describe ("Add ERC20 token permission", () => {

        it("Should add a new ERC20 token from deployer account", async () => {
        
            await gpCore.connect(deployer).approveAsset(mockERC20.address);
            expect(await gpCore.isAssetApproved(mockERC20.address)).to.equal(true);

        });


        it("Should add a new ERC20 token from asset manager account", async () => {

            await gpCore.connect(deployer).grantRole(assetManagerRole, signers[1].getAddress());

            await gpCore.connect(signers[1]).approveAsset(mockERC20.address);
            expect(await gpCore.isAssetApproved(mockERC20.address)).to.equal(true);
        });

        it("Should increase assetCount", async () => {

            expect(await gpCore.assetCount()).to.equal(0);
            await gpCore.connect(deployer).approveAsset(mockERC20.address);
            expect(await gpCore.assetCount()).to.equal(1);

        });

        it("Should should store asset in assets mapping", async () => {

            expect(await gpCore.assets(0)).to.equal(ethers.constants.AddressZero);
            await gpCore.connect(deployer).approveAsset(mockERC20.address);
            expect(await gpCore.assets(0)).to.equal(mockERC20.address);
            

        });

        it("Should not add a new ERC20 token from non asset manager account", async () => {

            await expect(gpCore.connect(signers[1]).approveAsset(mockERC20.address)).to.be.revertedWith("AccessControl: account " + signers[1].address.toLowerCase() + " is missing role " + assetManagerRole);
        });
    });

    describe ("Remove ERC20 token permission", () => {
        beforeEach(async () => {

            await gpCore.connect(deployer).approveAsset(mockERC20.address);
            expect(await gpCore.isAssetApproved(mockERC20.address)).to.equal(true);

        });

        it("Should remove an ERC20 token from deployer account", async () => {

            await gpCore.connect(deployer).removeAsset(mockERC20.address);
            expect(await gpCore.isAssetApproved(mockERC20.address)).to.equal(false);

        });

        it("Should remove an ERC20 token from asset manager account", async () => {

            await gpCore.connect(deployer).grantRole(assetManagerRole, signers[1].getAddress());

            await gpCore.connect(signers[1]).removeAsset(mockERC20.address);
            expect(await gpCore.isAssetApproved(mockERC20.address)).to.equal(false);

        });
    });

    describe ("Deposit ERC20 token", () => {
        beforeEach(async () => {

            await mockERC20.connect(signers[1]).mint(1000);
            await mockERC20.connect(signers[1]).approve(gpCore.address, 1000);	

        });
        
        it("Should not allow deposit from unnaproved ERC20", async () => {
                
            await expect(gpCore.connect(signers[1]).deposit(mockERC20.address, 1000)).to.be.revertedWithCustomError(gpCore, "ASSET_NOT_SUPPORTED");
    
        });

        it("Should deposit ERC20 token", async () => {
            
            await gpCore.connect(deployer).approveAsset(mockERC20.address);
            expect(await gpCore.isAssetApproved(mockERC20.address)).to.equal(true);

            await gpCore.connect(signers[1]).deposit(mockERC20.address, 1000);
            expect(await mockERC20.balanceOf(gpCore.address)).to.equal(1000);
            expect(await mockERC20.balanceOf(signers[1].address)).to.equal(0);

            expect(await gpCore.userBalances(signers[1].address, mockERC20.address)).to.equal(1000);

        });

        it("Should not deposit zero ERC20 token", async () => {
            
            await gpCore.connect(deployer).approveAsset(mockERC20.address);
            expect(await gpCore.isAssetApproved(mockERC20.address)).to.equal(true);

            await expect(gpCore.connect(signers[1]).deposit(mockERC20.address, 0)).to.be.revertedWithCustomError(gpCore, "INVALID_AMOUNT");
    
        });

    });

    describe ("Withdraw ERC20 token", () => {
        beforeEach(async () => {

            await gpCore.connect(deployer).approveAsset(mockERC20.address);

            await mockERC20.connect(signers[1]).mint(1000);
            await mockERC20.connect(signers[1]).approve(gpCore.address, 1000);	
            await gpCore.connect(signers[1]).deposit(mockERC20.address, 1000);
            
        });

        it("Should not allow withdraw from unapproved asset", async () => {
              
            await gpCore.connect(deployer).removeAsset(mockERC20.address);
            await expect(gpCore.connect(signers[1]).userWithdraw(mockERC20.address, 1001)).to.be.revertedWithCustomError(gpCore, "ASSET_NOT_SUPPORTED");
            await expect(gpCore.connect(signers[1]).userWithdraw(mockERC20.address, 10000001)).to.be.revertedWithCustomError(gpCore, "ASSET_NOT_SUPPORTED");
            await expect(gpCore.connect(signers[2]).userWithdraw(mockERC20.address, 5)).to.be.revertedWithCustomError(gpCore, "ASSET_NOT_SUPPORTED");
            await expect(gpCore.connect(signers[1]).userWithdraw(mockERC20.address, ethers.constants.MaxUint256)).to.be.revertedWithCustomError(gpCore, "ASSET_NOT_SUPPORTED");
    
        });
        
        it("Should not allow withdraw from insufficient balances account", async () => {
              
            await expect(gpCore.connect(signers[1]).userWithdraw(mockERC20.address, 1001)).to.be.revertedWithCustomError(gpCore, "INSUFFICIENT_BALANCE");
            await expect(gpCore.connect(signers[1]).userWithdraw(mockERC20.address, 10000001)).to.be.revertedWithCustomError(gpCore, "INSUFFICIENT_BALANCE");
            await expect(gpCore.connect(signers[2]).userWithdraw(mockERC20.address, 5)).to.be.revertedWithCustomError(gpCore, "INSUFFICIENT_BALANCE");
            await expect(gpCore.connect(signers[1]).userWithdraw(mockERC20.address, ethers.constants.MaxUint256)).to.be.revertedWithCustomError(gpCore, "INSUFFICIENT_BALANCE");
    
        });

        it("Should not withdraw zero ERC20 token", async () => {

            await expect(gpCore.connect(signers[1]).userWithdraw(mockERC20.address, 0)).to.be.revertedWithCustomError(gpCore, "INVALID_AMOUNT");
    
        });

        it("Should withdraw ERC20 token", async () => {

            await gpCore.connect(signers[1]).userWithdraw(mockERC20.address, 1000);
            expect(await mockERC20.balanceOf(gpCore.address)).to.equal(0);
            expect(await mockERC20.balanceOf(signers[1].address)).to.equal(1000);

            expect(await gpCore.userBalances(signers[1].address, mockERC20.address)).to.equal(0);

        });

    });

    describe ("Deposit Ether", () => {

        beforeEach(async () => {

            await gpCore.connect(deployer).approveAsset(ethers.constants.AddressZero);

        });
        
        it("Should deposit Ether", async () => {
            
            await gpCore.connect(signers[1]).deposit(ethers.constants.AddressZero, ethers.utils.parseEther("5"), {value: ethers.utils.parseEther("5")});
            expect(await gpCore.userBalances(signers[1].address, ethers.constants.AddressZero)).to.equal(ethers.utils.parseEther("5"));

            expect (await ethers.provider.getBalance(gpCore.address)).to.equal(ethers.utils.parseEther("5"));


            await gpCore.connect(signers[2]).deposit(ethers.constants.AddressZero, ethers.utils.parseEther("5"), {value: ethers.utils.parseEther("500")});
            expect(await gpCore.userBalances(signers[2].address, ethers.constants.AddressZero)).to.equal(ethers.utils.parseEther("500"));

            expect (await ethers.provider.getBalance(gpCore.address)).to.equal(ethers.utils.parseEther("505"));
        });

    });

    describe ("Withdraw Ether", () => {
        beforeEach(async () => {

            await gpCore.connect(deployer).approveAsset(ethers.constants.AddressZero);
            await gpCore.connect(signers[1]).deposit(ethers.constants.AddressZero, ethers.utils.parseEther("5"), {value: ethers.utils.parseEther("5")});
            
        });
        
        it("Should withdraw Ether", async () => {
                
            const balanceBefore = await ethers.provider.getBalance(signers[1].address);
            await gpCore.connect(signers[1]).userWithdraw(ethers.constants.AddressZero, ethers.utils.parseEther("5"));

            const balanceAfter = await ethers.provider.getBalance(signers[1].address);

            expect(await gpCore.userBalances(signers[1].address, ethers.constants.AddressZero)).to.equal(0);
            expect (await ethers.provider.getBalance(gpCore.address)).to.equal(0);
            expect(balanceAfter.sub(balanceBefore)).to.closeTo(ethers.utils.parseEther("5"), ethers.utils.parseEther("0.0001"));
            
        });

    });

});