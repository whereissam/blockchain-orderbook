const { expect } = require('chai')
const { ethers } = require('hardhat')


const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("Token", () => {
  let token

  beforeEach(async () => {
    //Fetch Token from Blockchain
    const Token = await ethers.getContractFactory('Token')
    token = await Token.deploy('Blockchain token', 'SSS', '1000000')
  })

  describe('Deployment', () => {
    const name = 'Blockchain token'
    const symbol = 'SSS'
    const decimal = '18'
    const totalSupply = '1000000'

    //Tests go inside here...
    it('has correct name', async () => {
      //Check that name is correct
      expect(name).to.equal(name)
    })

    it('has correct symbol', async () => {
      expect(await token.symbol()).to.equal(symbol)
    })

    it('has correct decimals', async () => {
      expect(await token.decimals()).to.equal(decimal)
    })

    it('has correct total supply', async () => {
      const value = tokens(totalSupply)
      expect(await token.totalSupply()).to.equal(value)
    })
  })
})