import { ethers, upgrades } from "hardhat";
import { expect } from "chai";

describe("Oracle Registry", () => {
    let gpCore : ethers.Contract;
    let signers: ethers.Signer[];
    let deployer: any;
    let mockOracle: ethers.Contract;
    let mockERC20: ethers.Contract;

    const oracleAdminRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ORACLE_ADMIN_ROLE"));
    
    beforeEach(async () => {

        signers = await ethers.getSigners();
        deployer = signers[0];
        const GpCoreFactory = await ethers.getContractFactory("GPCore");
        gpCore = await upgrades.deployProxy(GpCoreFactory, {});
        await gpCore.deployed();

        const MockOracleFactory = await ethers.getContractFactory("MockV3Aggregator");
        mockOracle = await MockOracleFactory.deploy(8, 10000000000000);

        const MockERC20Factory = await ethers.getContractFactory("MintableERC20");
        mockERC20 = await MockERC20Factory.deploy("Mock ERC20", "MERC20", 18);

    });
  
    describe ("Add price feed", () => {

        it("Should deploy an ETH price feed from deployer account", async () => {

            // goddamn it javascript!
            await gpCore["setPriceFeed(address)"](mockOracle.address);

            // goddamn it twice javascript!
            const price = await gpCore["getPrice()"]();
            expect(price).to.equal(10000000000000);


        });

        it("Should deploy an ERC20 price feed from oracle admin account", async () => {

            await gpCore.connect(deployer).grantRole(oracleAdminRole, signers[1].address);

            // goddamn it once again javascript!
            await gpCore.connect(signers[1])["setPriceFeed(address,address)"](mockERC20.address, mockOracle.address);

            const price = await gpCore["getPrice(address)"](mockERC20.address);
            expect(price).to.equal(10000000000000);


        });
    });

    describe ("Modify price feed", () => {

        beforeEach(async () => {

            await gpCore["setPriceFeed(address)"](mockOracle.address);
            await gpCore["setPriceFeed(address,address)"](signers[2].address, signers[3].address);
    
        });
        
        it("Should set a new price feed from deployer account", async () => {

            const initialPriceFeed = await gpCore.tokenToPriceFeed(ethers.constants.AddressZero);
           
            expect(initialPriceFeed.priceFeed).to.equal(mockOracle.address)

            await gpCore["setPriceFeed(address)"](signers[2].address);
            const finalPriceFeed = await gpCore.tokenToPriceFeed(ethers.constants.AddressZero);
            expect(finalPriceFeed.priceFeed).to.equal(signers[2].address)

        });

        it("Should set a new ERC20 price feed from deployer account", async () => {

            const initialPriceFeed = await gpCore.tokenToPriceFeed(signers[2].address);
            expect(initialPriceFeed.priceFeed).to.equal(signers[3].address)

            await gpCore["setPriceFeed(address,address)"](signers[2].address, signers[4].address);
            const finalPriceFeed = await gpCore.tokenToPriceFeed(signers[2].address);
            expect(finalPriceFeed.priceFeed).to.equal(signers[4].address)

        });
    
        it("Should set a new price feed from oracle manager account", async () => {

            await gpCore.connect(deployer).grantRole(oracleAdminRole, signers[1].address);

            const initialPriceFeed = await gpCore.tokenToPriceFeed(ethers.constants.AddressZero);
           
            expect(initialPriceFeed.priceFeed).to.equal(mockOracle.address)

            await gpCore.connect(signers[1])["setPriceFeed(address)"](signers[2].address);
            const finalPriceFeed = await gpCore.tokenToPriceFeed(ethers.constants.AddressZero);
            expect(finalPriceFeed.priceFeed).to.equal(signers[2].address)

        });

        it("Should set a new ERC20 price feed from oracle manager account", async () => {

            await gpCore.connect(deployer).grantRole(oracleAdminRole, signers[1].address);

            const initialPriceFeed = await gpCore.tokenToPriceFeed(signers[2].address);
           
            expect(initialPriceFeed.priceFeed).to.equal(signers[3].address)

            await gpCore.connect(signers[1])["setPriceFeed(address,address)"](signers[2].address, signers[4].address);
            const finalPriceFeed = await gpCore.tokenToPriceFeed(signers[2].address);
            expect(finalPriceFeed.priceFeed).to.equal(signers[4].address)

        });
    });

    describe ("Pause price feed", () => {

        beforeEach(async () => {

            await gpCore["setPriceFeed(address)"](mockOracle.address);
    
        });
        
        it("Should pause a price feed from deployer account", async () => {

            const initialPriceFeed = await gpCore.tokenToPriceFeed(ethers.constants.AddressZero);
           
            expect(initialPriceFeed.paused).to.equal(false)

            await gpCore["pauseFeed()"]();
            const finalPriceFeed = await gpCore.tokenToPriceFeed(ethers.constants.AddressZero);
            expect(finalPriceFeed.paused).to.equal(true)

        });
    
        it("Should pause a price feed from oracle manager account", async () => {

            const initialPriceFeed = await gpCore.tokenToPriceFeed(ethers.constants.AddressZero);
           
            expect(initialPriceFeed.paused).to.equal(false)

            await gpCore.connect(deployer).grantRole(oracleAdminRole, signers[1].address);

            await gpCore.connect(signers[1])["pauseFeed()"]();
            const finalPriceFeed = await gpCore.tokenToPriceFeed(ethers.constants.AddressZero);
            expect(finalPriceFeed.paused).to.equal(true)
    
        });
        
    });

    describe ("Unpause price feed", () => {

        beforeEach(async () => {

            await gpCore["setPriceFeed(address)"](mockOracle.address);
            await gpCore["pauseFeed()"]();

            const initialPriceFeed = await gpCore.tokenToPriceFeed(ethers.constants.AddressZero);
            expect(initialPriceFeed.paused).to.equal(true)
    
        });
        
        it("Should unpause a price feed from deployer account", async () => {

            await gpCore["unpauseFeed()"]();
            const finalPriceFeed = await gpCore.tokenToPriceFeed(ethers.constants.AddressZero);
            expect(finalPriceFeed.paused).to.equal(false)

        });
    
        it("Should unpause a price feed from oracle manager account", async () => {

            await gpCore.connect(deployer).grantRole(oracleAdminRole, signers[1].address);

            await gpCore.connect(signers[1])["unpauseFeed()"]();
            const finalPriceFeed = await gpCore.tokenToPriceFeed(ethers.constants.AddressZero);
            expect(finalPriceFeed.paused).to.equal(false)
        });

    });

    describe ("Displays price feed updates properly", () => {

        beforeEach(async () => {

            await gpCore["setPriceFeed(address)"](mockOracle.address);
            
    
        });
        
        it("Should display an updated price feed", async () => {

            const initialPrice = await gpCore["getPrice()"]();
            expect(initialPrice).to.equal(10000000000000);

            await mockOracle.updateAnswer(20000000000000);

            const finalPrice = await gpCore["getPrice()"]();
            expect(finalPrice).to.equal(20000000000000);

        });
    });

});