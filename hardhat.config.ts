import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-truffle5";
import '@openzeppelin/hardhat-upgrades';
import "@nomiclabs/hardhat-etherscan";
import "hardhat-gas-reporter";
import "hardhat-deploy";

require('dotenv').config()

const TENDERLY_FORK_URL = process.env.TENDERLY_FORK_URL || "";


const config: HardhatUserConfig = {
  networks: {
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: [
        process.env.DEPLOYER_PRIVATE_KEY as string, 
        process.env.INTEGRATION_TEST_ACC1_PRIVATE_KEY as string, 
        process.env.INTEGRATION_TEST_ACC2_PRIVATE_KEY as string,
        process.env.INTEGRATION_TEST_ACC3_PRIVATE_KEY as string,
      ],
      chainId: 80001,
    },
    polygonZkTestnet: {
      url: "https://rpc.public.zkevm-test.net",
    },
    "tenderly-fork": {
      url: TENDERLY_FORK_URL
    },
  },
  namedAccounts: {
    account0: 0
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY
  },
  solidity: {
    compilers: [
        {
            version: "0.8.19",
            settings: {
              viaIR: true,
              metadata: {
                appendCBOR: false,
                bytecodeHash: "none"
              },
              optimizer: {
                enabled: true,
                runs: 1,
              }
            }
          }
    ]
  }

};

export default config;