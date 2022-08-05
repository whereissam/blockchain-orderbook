const { expect } = require('chai')
const { ethers } = require('hardhat')


const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe("Token", () => {
  let token, accounts, deployer, receiver

  beforeEach(async () => {
    //Fetch Token from Blockchain
    const Token = await ethers.getContractFactory('Token')
    token = await Token.deploy('Blockchain token', 'SSS', '1000000')

    accounts = await ethers.getSigners()
    deployer = accounts[0]
    receiver = accounts[1]
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

    it('assigns total supply to deployer', async () => {
      expect(await token.balanceOf(deployer.address)).to.equal(tokens(totalSupply))
    })
  })

  describe('Sending Token', () => {

    let amount, transaction, result

    describe('Success', () => {
      beforeEach(async () => {//before sending Token, check first
        //Transfer tokens
        amount = tokens(100)
        transaction = await token.connect(deployer).transfer(receiver.address, amount)
        result = await transaction.wait()
      })

      it('Transfer token balances', async () => {
        //Log balance before transfer
        // console.log("deployer balance before transfer", await token.balanceOf(deployer.address))
        // console.log("deployer balance before transfer", await token.balanceOf(receiver.address))

        //Ensure that tokens were transfered(balance change) 
        expect(await token.balanceOf(deployer.address)).to.equal(tokens(999900))
        expect(await token.balanceOf(receiver.address)).to.equal(amount)

        //Log balance after transfer
        // console.log("deployer balance after transfer", await token.balanceOf(deployer.address))
        // console.log("deployer balance after transfer", await token.balanceOf(receiver.address))

      })

      it('emits a Transfer event', async () => {
        // console.log(result)
        // console.log(result.events[0].args)
        const event = result.events[0]
        expect(event.event).to.equal('Transfer')

        const args = event.args
        expect(args.from).to.equal(deployer.address)
        expect(args.to).to.equal(receiver.address)
        expect(args.value).equal(amount)
      })

    })

    describe('Failure', () => {
      it('rejects insufficient balances', async () => {
        //Transfer more tokens than deployer has - 100M
        const invalidAmount = tokens(100000000)
        await expect(token.connect(deployer).transfer(receiver.address, invalidAmount)).to.be.reverted
      })

      it('rejects invalid recipient', async () => {
        const invalidAmount = tokens(100)
        await expect(token.connect(deployer).transfer('0x0000000000000000000000000000000000000000 ', invalidAmount)).to.be.reverted
      })
    })

  })
})