import { ethers, upgrades } from 'hardhat';

async function main() {
    const GpCoreFactory = await ethers.getContractFactory("GPCore");
    const gpCore = await upgrades.deployProxy(GpCoreFactory, {
        initializer: 'initialize',
    });
    await gpCore.deployed();
    console.log("GPCore deployed to:", gpCore.address);
    }

main()
