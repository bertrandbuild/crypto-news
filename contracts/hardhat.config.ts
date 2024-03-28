import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

require('dotenv').config()

const galadrielDevnet: never[] = []
if (process.env.PRIVATE_KEY_CUSTOM) {
  galadrielDevnet.push(process.env.PRIVATE_KEY_CUSTOM as never)
}
const localhostPrivateKeys: never[] = []
if (process.env.PRIVATE_KEY_LOCALHOST) {
  localhostPrivateKeys.push(process.env.PRIVATE_KEY_LOCALHOST as never)
}

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    galadriel: {
      chainId: 696969,
      url: "https://testnet.galadriel.com/",
      accounts: galadrielDevnet,
    },
    'base-sepolia': {
      url: 'https://sepolia.base.org',
      accounts: [process.env.PRIVATE_KEY_CUSTOM as string],
      gasPrice: 1000000000,
    },
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      chainId: 1337,
      url: "http://127.0.0.1:8545",
      accounts: localhostPrivateKeys,
    }
  },
};

export default config;
