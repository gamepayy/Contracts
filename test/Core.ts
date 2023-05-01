import { ethers, upgrades } from "hardhat";
import { expect } from "chai";


describe("GP Core", () => {
    let gpCore : ethers.Contract;
    let signers: ethers.Signer[];
    let deployer: any;

    const pauserRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("PAUSER_ROLE"));
    const upgraderRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("UPGRADER_ROLE"));
    const fundsManagerRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FUNDS_MANAGER_ROLE"));
    const assetManagerRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ASSET_MANAGER_ROLE"));
    const arbitratorRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ARBITRATOR_ROLE"));
    const oracleAdminRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ORACLE_ADMIN_ROLE"));
  
    beforeEach(async () => {

      signers = await ethers.getSigners();
      deployer = signers[0];
      const GpCoreFactory = await ethers.getContractFactory("GPCore");
      gpCore = await upgrades.deployProxy(GpCoreFactory, {});
      await gpCore.deployed();
      
    });
  
    it("Should pause", async () => {
      
      await gpCore.connect(deployer).pause();

    });

    it("Should unpause", async () => {

      await gpCore.connect(deployer).pause();
      await gpCore.connect(deployer).unpause();

    });

    it("Should return the correct default admin role", async () => {
      
      const defaultAdminRole = await gpCore.DEFAULT_ADMIN_ROLE();

      expect(defaultAdminRole).to.equals('0x0000000000000000000000000000000000000000000000000000000000000000');

      const admin = await gpCore.hasRole(defaultAdminRole, deployer.address);

      expect(admin).to.equals(true);

      const notAdmin = await gpCore.hasRole(defaultAdminRole, signers[1].address);

      expect(notAdmin).to.equals(false);

    });

    it("Should return correct non-admin roles", async () => {

      expect(await gpCore.hasRole(pauserRole, deployer.address)).to.equals(true);
      expect(await gpCore.hasRole(upgraderRole, deployer.address)).to.equals(true);
      expect(await gpCore.hasRole(fundsManagerRole, deployer.address)).to.equals(true);
      expect(await gpCore.hasRole(assetManagerRole, deployer.address)).to.equals(true);
      expect(await gpCore.hasRole(arbitratorRole, deployer.address)).to.equals(true);
      expect(await gpCore.hasRole(oracleAdminRole, deployer.address)).to.equals(true);

      expect(await gpCore.hasRole(pauserRole, signers[1].address)).to.equals(false);
      expect(await gpCore.hasRole(upgraderRole, signers[1].address)).to.equals(false);
      expect(await gpCore.hasRole(fundsManagerRole, signers[1].address)).to.equals(false);
      expect(await gpCore.hasRole(assetManagerRole, signers[1].address)).to.equals(false);
      expect(await gpCore.hasRole(arbitratorRole, signers[1].address)).to.equals(false);
      expect(await gpCore.hasRole(oracleAdminRole, signers[1].address)).to.equals(false);

    });

    it("Should grant roles", async () => {
      
      expect(await gpCore.hasRole(pauserRole, signers[1].address)).to.equals(false);
      await gpCore.connect(deployer).grantRole(pauserRole, signers[1].address);
      expect(await gpCore.hasRole(pauserRole, signers[1].address)).to.equals(true);

      expect(await gpCore.hasRole(upgraderRole, signers[2].address)).to.equals(false);
      await gpCore.connect(deployer).grantRole(upgraderRole, signers[2].address);
      expect(await gpCore.hasRole(upgraderRole, signers[2].address)).to.equals(true);

      expect(await gpCore.hasRole(fundsManagerRole, signers[3].address)).to.equals(false);
      await gpCore.connect(deployer).grantRole(fundsManagerRole, signers[3].address);
      expect(await gpCore.hasRole(fundsManagerRole, signers[3].address)).to.equals(true);

      expect(await gpCore.hasRole(assetManagerRole, signers[4].address)).to.equals(false);
      await gpCore.connect(deployer).grantRole(assetManagerRole, signers[4].address);
      expect(await gpCore.hasRole(assetManagerRole, signers[4].address)).to.equals(true);

      expect(await gpCore.hasRole(arbitratorRole, signers[5].address)).to.equals(false);
      await gpCore.connect(deployer).grantRole(arbitratorRole, signers[5].address);
      expect(await gpCore.hasRole(arbitratorRole, signers[5].address)).to.equals(true);

      expect(await gpCore.hasRole(oracleAdminRole, signers[6].address)).to.equals(false);
      await gpCore.connect(deployer).grantRole(oracleAdminRole, signers[6].address);
      expect(await gpCore.hasRole(oracleAdminRole, signers[6].address)).to.equals(true);

    });

    it("Should upgrade the contract to a new version", async () => {
      
      expect(await gpCore.hasRole(pauserRole, signers[1].address)).to.equals(false);
      await gpCore.connect(deployer).grantRole(pauserRole, signers[1].address);
      expect(await gpCore.hasRole(pauserRole, signers[1].address)).to.equals(true);

      const GpCoreV2Factory = await ethers.getContractFactory("GPCoreUpgradeableMock");
      const gpCoreV2 = await upgrades.upgradeProxy(gpCore.address, GpCoreV2Factory);
      await gpCoreV2.deployed();

      expect(await gpCoreV2.hasRole(pauserRole, signers[1].address)).to.equals(true);
      expect(gpCoreV2.address).to.equals(gpCore.address);

      expect(await gpCoreV2.newFunction()).to.equals(1);

    });


});