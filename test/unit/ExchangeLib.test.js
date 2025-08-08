const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ExchangeLib Library Tests", function () {
  let exchangeLib;
  let testContract;

  before(async function () {
    // Deploy the library
    const ExchangeLib = await ethers.getContractFactory("ExchangeLib");
    exchangeLib = await ExchangeLib.deploy();
    await exchangeLib.deployed();

    // Create a test contract that uses the library
    const TestContract = await ethers.getContractFactory("TestExchangeLib", {
      libraries: {
        ExchangeLib: exchangeLib.address,
      },
    });
    testContract = await TestContract.deploy();
    await testContract.deployed();
  });

  describe("Fee Calculations", function () {
    it("Should calculate correct fee amount", async function () {
      const amount = ethers.utils.parseEther("100");
      const feePercent = 100; // 1%
      const expectedFee = ethers.utils.parseEther("1");

      const calculatedFee = await testContract.calculateFee(amount, feePercent);
      expect(calculatedFee).to.equal(expectedFee);
    });

    it("Should calculate correct amount after fee", async function () {
      const amount = ethers.utils.parseEther("100");
      const feePercent = 100; // 1%
      const expectedAmount = ethers.utils.parseEther("99");

      const calculatedAmount = await testContract.calculateAmountAfterFee(amount, feePercent);
      expect(calculatedAmount).to.equal(expectedAmount);
    });
  });

  describe("Order Validation", function () {
    it("Should validate correct order parameters", async function () {
      const [owner, addr1] = await ethers.getSigners();
      
      const isValid = await testContract.isValidOrder(
        addr1.address,      // tokenGet
        ethers.utils.parseEther("10"), // amountGet
        owner.address,     // tokenGive  
        ethers.utils.parseEther("5")   // amountGive
      );
      
      expect(isValid).to.be.true;
    });

    it("Should reject order with zero amounts", async function () {
      const [owner, addr1] = await ethers.getSigners();
      
      const isValid = await testContract.isValidOrder(
        addr1.address,      // tokenGet
        0,                  // amountGet - zero amount
        owner.address,     // tokenGive  
        ethers.utils.parseEther("5")   // amountGive
      );
      
      expect(isValid).to.be.false;
    });

    it("Should reject order with same token addresses", async function () {
      const [owner] = await ethers.getSigners();
      
      const isValid = await testContract.isValidOrder(
        owner.address,     // tokenGet
        ethers.utils.parseEther("10"), // amountGet
        owner.address,     // tokenGive - same as tokenGet
        ethers.utils.parseEther("5")   // amountGive
      );
      
      expect(isValid).to.be.false;
    });
  });
});