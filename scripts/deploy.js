const { ethers } = require("hardhat")
// const hre = require("hardhat")

async function main () {
  //Fetch contract to deploy
  const Token = await ethers.getContractFactory('Token')
  const Exchange = await ethers.getContractFactory('Exchange')

  //Fetch accounts
  const accounts = await ethers.getSigners()

  console.log(`Account fetched:\n${accounts[0].address}\n${accounts[1].address}\n`)

  //Deploy
  const SSS = await Token.deploy('Blockchain token', 'SSS', '1000000')
  await SSS.deployed()
  console.log(`SSS Deploy to: ${SSS.address}`)

  const mETH = await Token.deploy('mETH', 'mETH', '1000000')
  await mETH.deployed()
  console.log(`mETH Deploy to: ${mETH.address}`)

  const mDAI = await Token.deploy('mDAI', 'mDAI', '1000000')
  await mDAI.deployed()
  console.log(`mDAI Deploy to: ${mDAI.address}`)

  const exchange = await Exchange.deploy(accounts[1].address, 10)
  await exchange.deployed()
  console.log(`Exchange Deployed to: ${exchange.address}`)

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
