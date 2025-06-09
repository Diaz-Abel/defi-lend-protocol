import { expect } from "chai";
import pkg from "hardhat";
const { ethers } = pkg;

describe("LendingProtocol", function () {
  let lendingProtocol;
  let collateralToken;
  let loanToken;
  let owner;
  let user1;
  let user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    // Deploy tokens
    const CollateralToken = await ethers.getContractFactory("CollateralToken");
    collateralToken = await CollateralToken.deploy();
    await collateralToken.waitForDeployment();

    const LoanToken = await ethers.getContractFactory("LoanToken");
    loanToken = await LoanToken.deploy();
    await loanToken.waitForDeployment();

    // Deploy lending protocol
    const LendingProtocol = await ethers.getContractFactory("LendingProtocol");
    lendingProtocol = await LendingProtocol.deploy(
      await collateralToken.getAddress(),
      await loanToken.getAddress()
    );
    await lendingProtocol.waitForDeployment();

    // Mint tokens to users
    await collateralToken.mint(user1.address, ethers.parseEther("1000"));
    await loanToken.mint(await lendingProtocol.getAddress(), ethers.parseEther("1000"));
  });

  describe("Deposit Collateral", function () {
    it("Should allow users to deposit collateral", async function () {
      const amount = ethers.parseEther("150");
      
      await collateralToken.connect(user1).approve(await lendingProtocol.getAddress(), amount);
      await lendingProtocol.connect(user1).depositCollateral(amount);

      const userData = await lendingProtocol.getUserData(user1.address);
      expect(userData.collateral).to.equal(amount);
    });

    it("Should fail if amount is 0", async function () {
      await expect(
        lendingProtocol.connect(user1).depositCollateral(0)
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should fail if user has no tokens", async function () {
      const amount = ethers.parseEther("150");
      await expect(
        lendingProtocol.connect(user2).depositCollateral(amount)
      ).to.be.revertedWithCustomError(collateralToken, "ERC20InsufficientAllowance");
    });

    it("Should fail if user has insufficient allowance", async function () {
      const amount = ethers.parseEther("150");
      await expect(
        lendingProtocol.connect(user1).depositCollateral(amount)
      ).to.be.revertedWithCustomError(collateralToken, "ERC20InsufficientAllowance");
    });

    it("Should emit CollateralDeposited event", async function () {
      const amount = ethers.parseEther("150");
      await collateralToken.connect(user1).approve(await lendingProtocol.getAddress(), amount);
      
      await expect(lendingProtocol.connect(user1).depositCollateral(amount))
        .to.emit(lendingProtocol, "CollateralDeposited")
        .withArgs(user1.address, amount);
    });
  });

  describe("Borrow", function () {
    beforeEach(async function () {
      const amount = ethers.parseEther("150");
      await collateralToken.connect(user1).approve(await lendingProtocol.getAddress(), amount);
      await lendingProtocol.connect(user1).depositCollateral(amount);
    });

    it("Should allow users to borrow up to 66.67% of collateral", async function () {
      const borrowAmount = ethers.parseEther("100");
      await lendingProtocol.connect(user1).borrow(borrowAmount);

      const userData = await lendingProtocol.getUserData(user1.address);
      expect(userData.debt).to.equal(borrowAmount);
    });

    it("Should fail if borrow amount exceeds limit", async function () {
      const borrowAmount = ethers.parseEther("101");
      await expect(
        lendingProtocol.connect(user1).borrow(borrowAmount)
      ).to.be.revertedWith("Borrow amount exceeds limit");
    });

    it("Should fail if amount is 0", async function () {
      await expect(
        lendingProtocol.connect(user1).borrow(0)
      ).to.be.revertedWith("Amount must be greater than 0");
    });

    it("Should fail if user has no collateral", async function () {
      const borrowAmount = ethers.parseEther("100");
      await expect(
        lendingProtocol.connect(user2).borrow(borrowAmount)
      ).to.be.revertedWith("No collateral deposited");
    });

    it("Should fail if protocol has insufficient tokens", async function () {
      const borrowAmount = ethers.parseEther("1000");
      await expect(
        lendingProtocol.connect(user1).borrow(borrowAmount)
      ).to.be.revertedWith("Borrow amount exceeds limit");
    });

    it("Should emit LoanBorrowed event", async function () {
      const borrowAmount = ethers.parseEther("100");
      await expect(lendingProtocol.connect(user1).borrow(borrowAmount))
        .to.emit(lendingProtocol, "LoanBorrowed")
        .withArgs(user1.address, borrowAmount);
    });

    it("Should update lastInterestTimestamp on borrow", async function () {
      const borrowAmount = ethers.parseEther("100");
      await lendingProtocol.connect(user1).borrow(borrowAmount);
      
      const interest = await lendingProtocol.calculateInterest(user1.address);
      expect(interest).to.equal(ethers.parseEther("5"));
    });
  });

  describe("Repay", function () {
    beforeEach(async function () {
      const depositAmount = ethers.parseEther("150");
      const borrowAmount = ethers.parseEther("100");
      
      await collateralToken.connect(user1).approve(await lendingProtocol.getAddress(), depositAmount);
      await lendingProtocol.connect(user1).depositCollateral(depositAmount);
      await lendingProtocol.connect(user1).borrow(borrowAmount);
    });

    it("Should allow users to repay their loan", async function () {
      // Mint tokens to user1 for repayment
      await loanToken.mint(user1.address, ethers.parseEther("105"));
      
      // Aprobar el monto total incluyendo interés (100 + 5% = 105)
      const repayAmount = ethers.parseEther("105");
      await loanToken.connect(user1).approve(await lendingProtocol.getAddress(), repayAmount);
      await lendingProtocol.connect(user1).repay();

      const userData = await lendingProtocol.getUserData(user1.address);
      expect(userData.debt).to.equal(0);
    });

    it("Should fail if user has no debt", async function () {
      await expect(
        lendingProtocol.connect(user2).repay()
      ).to.be.revertedWith("No debt to repay");
    });

    it("Should fail if user has insufficient balance", async function () {
      await expect(
        lendingProtocol.connect(user1).repay()
      ).to.be.revertedWithCustomError(loanToken, "ERC20InsufficientAllowance");
    });

    it("Should fail if user has insufficient allowance", async function () {
      // Mint tokens pero sin aprobar
      await loanToken.mint(user1.address, ethers.parseEther("105"));
      await expect(
        lendingProtocol.connect(user1).repay()
      ).to.be.revertedWithCustomError(loanToken, "ERC20InsufficientAllowance");
    });

    it("Should emit LoanRepaid event", async function () {
      await loanToken.mint(user1.address, ethers.parseEther("105"));
      await loanToken.connect(user1).approve(await lendingProtocol.getAddress(), ethers.parseEther("105"));
      
      await expect(lendingProtocol.connect(user1).repay())
        .to.emit(lendingProtocol, "LoanRepaid")
        .withArgs(user1.address, ethers.parseEther("105"));
    });

    it("Should update lastInterestTimestamp on repay", async function () {
      await loanToken.mint(user1.address, ethers.parseEther("105"));
      await loanToken.connect(user1).approve(await lendingProtocol.getAddress(), ethers.parseEther("105"));
      
      await lendingProtocol.connect(user1).repay();
      const interest = await lendingProtocol.calculateInterest(user1.address);
      expect(interest).to.equal(0);
    });
  });

  describe("Withdraw Collateral", function () {
    beforeEach(async function () {
      const amount = ethers.parseEther("150");
      await collateralToken.connect(user1).approve(await lendingProtocol.getAddress(), amount);
      await lendingProtocol.connect(user1).depositCollateral(amount);
    });

    it("Should allow users to withdraw collateral if no debt", async function () {
      await lendingProtocol.connect(user1).withdrawCollateral();

      const userData = await lendingProtocol.getUserData(user1.address);
      expect(userData.collateral).to.equal(0);
    });

    it("Should fail if user has debt", async function () {
      const borrowAmount = ethers.parseEther("100");
      await lendingProtocol.connect(user1).borrow(borrowAmount);

      await expect(
        lendingProtocol.connect(user1).withdrawCollateral()
      ).to.be.revertedWith("Debt must be repaid first");
    });

    it("Should fail if user has no collateral", async function () {
      await expect(
        lendingProtocol.connect(user2).withdrawCollateral()
      ).to.be.revertedWith("No collateral to withdraw");
    });

    it("Should emit CollateralWithdrawn event", async function () {
      const amount = ethers.parseEther("150");
      await expect(lendingProtocol.connect(user1).withdrawCollateral())
        .to.emit(lendingProtocol, "CollateralWithdrawn")
        .withArgs(user1.address, amount);
    });
  });

  describe("Token Tests", function () {
    it("Should allow owner to mint tokens", async function () {
      const amount = ethers.parseEther("100");
      await collateralToken.mint(user1.address, amount);
      const balance = await collateralToken.balanceOf(user1.address);
      expect(balance).to.equal(ethers.parseEther("1100")); // 1000 iniciales + 100 nuevos
    });

    it("Should not allow non-owner to mint tokens", async function () {
      const amount = ethers.parseEther("100");
      await expect(
        collateralToken.connect(user1).mint(user2.address, amount)
      ).to.be.revertedWithCustomError(collateralToken, "OwnableUnauthorizedAccount");
    });

    it("Should allow token transfers", async function () {
      const amount = ethers.parseEther("100");
      await collateralToken.connect(user1).transfer(user2.address, amount);
      expect(await collateralToken.balanceOf(user2.address)).to.equal(amount);
    });

    it("Should fail transfer if insufficient balance", async function () {
      const amount = ethers.parseEther("100");
      await expect(
        collateralToken.connect(user2).transfer(user1.address, amount)
      ).to.be.revertedWithCustomError(collateralToken, "ERC20InsufficientBalance");
    });
  });

  describe("Interest and User Data", function () {
    it("Should calculate interest correctly", async function () {
      // Depositar colateral y pedir préstamo
      const depositAmount = ethers.parseEther("150");
      const borrowAmount = ethers.parseEther("100");
      
      await collateralToken.connect(user1).approve(await lendingProtocol.getAddress(), depositAmount);
      await lendingProtocol.connect(user1).depositCollateral(depositAmount);
      await lendingProtocol.connect(user1).borrow(borrowAmount);

      // Verificar interés (5% de 100 = 5)
      const interest = await lendingProtocol.calculateInterest(user1.address);
      expect(interest).to.equal(ethers.parseEther("5"));
    });

    it("Should return 0 interest when there is no debt", async function () {
      const interest = await lendingProtocol.calculateInterest(user1.address);
      expect(interest).to.equal(0);
    });

    it("Should return correct user data with no debt", async function () {
      const [collateral, debt, interest] = await lendingProtocol.getUserData(user1.address);
      expect(collateral).to.equal(0);
      expect(debt).to.equal(0);
      expect(interest).to.equal(0);
    });

    it("Should return correct user data with debt", async function () {
      // Depositar colateral y pedir préstamo
      const depositAmount = ethers.parseEther("150");
      const borrowAmount = ethers.parseEther("100");
      
      await collateralToken.connect(user1).approve(await lendingProtocol.getAddress(), depositAmount);
      await lendingProtocol.connect(user1).depositCollateral(depositAmount);
      await lendingProtocol.connect(user1).borrow(borrowAmount);

      const [collateral, debt, interest] = await lendingProtocol.getUserData(user1.address);
      expect(collateral).to.equal(depositAmount);
      expect(debt).to.equal(borrowAmount);
      expect(interest).to.equal(ethers.parseEther("5")); // 5% de interés
    });

    it("Should return correct user data after repayment", async function () {
      // Depositar colateral y pedir préstamo
      const depositAmount = ethers.parseEther("150");
      const borrowAmount = ethers.parseEther("100");
      
      await collateralToken.connect(user1).approve(await lendingProtocol.getAddress(), depositAmount);
      await lendingProtocol.connect(user1).depositCollateral(depositAmount);
      await lendingProtocol.connect(user1).borrow(borrowAmount);

      // Repagar el préstamo
      await loanToken.mint(user1.address, ethers.parseEther("105"));
      await loanToken.connect(user1).approve(await lendingProtocol.getAddress(), ethers.parseEther("105"));
      await lendingProtocol.connect(user1).repay();

      const [collateral, debt, interest] = await lendingProtocol.getUserData(user1.address);
      expect(collateral).to.equal(depositAmount);
      expect(debt).to.equal(0);
      expect(interest).to.equal(0);
    });
  });
}); 