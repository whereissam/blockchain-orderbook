const { ethers } = require("hardhat")
// const hre = require("hardhat")

async function main () {
  //Fetch contract to deploy
  const Token = await ethers.getContractFactory('Token')

  //Deploy
  const token = await Token.deploy()
  await token.deployed()
  console.log(`Token Deploy to: ${token.address}`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
