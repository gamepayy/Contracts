import { ethers, upgrades } from "hardhat";
import { expect } from "chai";


describe("Funds Manager", () => {
    let gpCore : ethers.Contract;
    let signers: ethers.Signer[];
    let deployer: any;

    const fundsManagerRole = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("FUNDS_MANAGER_ROLE"));
    
    beforeEach(async () => {

      signers = await ethers.getSigners();
      deployer = signers[0];
      const GpCoreFactory = await ethers.getContractFactory("GPCore");
      gpCore = await upgrades.deployProxy(GpCoreFactory, {});
      await gpCore.deployed();

      await deployer.sendTransaction({to: gpCore.address, value: ethers.utils.parseEther("100")});

    });
  
    it("Should withdraw funds with deployer account", async () => {
      
        const initialBalance = await ethers.provider.getBalance(deployer.address);

        await gpCore.connect(deployer).withdrawFunds(deployer.address, ethers.utils.parseEther("10"));

        const finalBalance = await ethers.provider.getBalance(deployer.address);

        expect(finalBalance.sub(initialBalance)).to.closeTo(ethers.utils.parseEther("10"), ethers.utils.parseEther("0.001"));
    });

    it("Should withdraw funds with funds manager account", async () => {

        expect (await gpCore.hasRole(fundsManagerRole, signers[1].address)).to.equals(false);
        await gpCore.connect(deployer).grantRole(fundsManagerRole, signers[1].address);
        expect (await gpCore.hasRole(fundsManagerRole, signers[1].address)).to.equals(true);

        const initialBalance = await ethers.provider.getBalance(signers[1].address);

        await gpCore.connect(signers[1]).withdrawFunds(signers[1].address, ethers.utils.parseEther("10"));

        const finalBalance = await ethers.provider.getBalance(signers[1].address);

        expect(finalBalance.sub(initialBalance)).to.closeTo(ethers.utils.parseEther("10"), ethers.utils.parseEther("0.001"));

    });

    it("Should revert funds withdrawal attempt from non funds manager account", async () => {
      
      expect(await gpCore.hasRole(fundsManagerRole, signers[1].address)).to.equals(false);

      await expect(gpCore.connect(signers[1]).withdrawFunds(signers[1].address, ethers.utils.parseEther("10"))).to.be.revertedWith("AccessControl: account " + signers[1].address.toLowerCase() + " is missing role " + fundsManagerRole);

    });

});