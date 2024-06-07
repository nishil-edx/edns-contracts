import { exec as _exec } from 'child_process'

import '@nomiclabs/hardhat-ethers'
import '@nomiclabs/hardhat-solhint'
import '@nomiclabs/hardhat-truffle5'
import '@nomiclabs/hardhat-waffle'
import dotenv from 'dotenv'
import 'hardhat-abi-exporter'
import 'hardhat-contract-sizer'
import 'hardhat-deploy'
import 'hardhat-gas-reporter'
import { HardhatUserConfig } from 'hardhat/config'
import { promisify } from 'util'

const exec = promisify(_exec)

// hardhat actions
import './tasks/accounts'
import './tasks/archive_scan'
import './tasks/save'
import './tasks/seed'

// Load environment variables from .env file. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
dotenv.config({ debug: false })

let real_accounts = undefined
if (process.env.DEPLOYER_KEY) {
  real_accounts = [
    process.env.DEPLOYER_KEY,
    process.env.OWNER_KEY || process.env.DEPLOYER_KEY,
  ]
}

// circular dependency shared with actions
export const archivedDeploymentPath = './deployments/archive'

const config: HardhatUserConfig = {
  networks: {
    hardhat: {
      saveDeployments: false,
      tags: ['test', 'legacy', 'use_root'],
      allowUnlimitedContractSize: false,
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
      saveDeployments: false,
      tags: ['test', 'legacy', 'use_root'],
    },
    rinkeby: {
      url: `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`,
      tags: ['test', 'legacy', 'use_root'],
      chainId: 4,
      accounts: real_accounts,
    },
    ropsten: {
      url: `https://ropsten.infura.io/v3/${process.env.INFURA_API_KEY}`,
      tags: ['test', 'legacy', 'use_root'],
      chainId: 3,
      accounts: real_accounts,
    },
    goerli: {
      url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
      tags: ['test', 'legacy', 'use_root'],
      chainId: 5,
      accounts: real_accounts,
    },
    sepolia: {
      url: `https://sepolia.infura.io/v3/66e35b8932754052acbddffc9c06ed38`,
      tags: ['test', 'legacy', 'use_root'],
      chainId: 11155111,
      accounts: real_accounts,
    },
    holesky: {
      url: `https://holesky.drpc.org`,
      tags: ['test', 'use_root'],
      chainId: 17000,
      accounts: real_accounts,
      gasPrice: 1259042676
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      tags: ['legacy', 'use_root'],
      chainId: 1,
      accounts: real_accounts,
    },
    mumbai: {
      url: `https://polygon-mumbai.infura.io/v3/66e35b8932754052acbddffc9c06ed38`,
      tags: ['legacy', 'use_root'],
      chainId: 80001,
      accounts: real_accounts,
    },
    edexa_testnet: {
      url: `https://testnet.edexa.network/rpc`,
      tags: ['use_root'],
      chainId: 1995,
      accounts: real_accounts,
      gasPrice: 2100000,
      gasMultiplier: 2,
    },
    edexa_mainnet: {
      url: `https://mainnet.edexa.network/rpc`,
      tags: ['use_root'],
      chainId: 5424,
      accounts: real_accounts,
      gasPrice: 21000
    },
    amoy: {
      url: `https://rpc-amoy.polygon.technology`,
      tags: ['use_root'],
      chainId: 80002,
      accounts: real_accounts,
      gasPrice:500000000,
    }
  },
  mocha: {},
  solidity: {
    compilers: [
      {
        version: '0.8.17',
        settings: {
          optimizer: {
            enabled: true,
            runs: 1200,
          },
        },
      },
      // for DummyOldResolver contract
      {
        version: '0.4.11',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.5.0',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  abiExporter: {
    path: './build/contracts',
    runOnCompile: true,
    clear: true,
    flat: true,
    except: [
      'Controllable$',
      'INameWrapper$',
      'SHA1$',
      'Ownable$',
      'NameResolver$',
      'TestBytesUtils$',
      'legacy/*',
    ],
    spacing: 2,
    pretty: true,
  },
  namedAccounts: {
    deployer: {
      default: 0,
    },
    owner: {
      default: 0,
      // 1: '0xFe89cc7aBB2C4183683ab71653C4cdc9B02D44b7',
    },
  },
  external: {
    contracts: [
      {
        artifacts: [archivedDeploymentPath],
      },
    ],
  },
}

export default config
