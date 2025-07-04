require("@nomicfoundation/hardhat-toolbox")
require('dotenv').config()

const privateKeys = process.env.PRIVATE_KEYS || ""

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.9",
  networks: {
    localhost: {},
    ...(privateKeys && process.env.INFURA_API_KEY && {
      kovan: {
        url: `https://kovan.infura.io/v3/${process.env.INFURA_API_KEY}`,
        accounts: privateKeys.split(',')
      },
      goerli: {
        url: `https://goerli.infura.io/v3/${process.env.INFURA_API_KEY}`,
        accounts: privateKeys.split(',')
      }
    })
  }
}
