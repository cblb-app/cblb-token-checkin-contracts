const { expect } = require("chai");
const { ethers, waffle } = require("hardhat");

describe("Checkin contract advance testing", function () {
  // use Alchemy mainnet fork do advance testing

  let userA, userB, userC, userD, dev;
  let cblbTokenInstance;
  let cblbCheckinInstance;

  beforeEach(async () => {
    [userA, userB, userC, userD, userE, dev] = await ethers.getSigners();

    const CBLB = await ethers.getContractFactory("CBLB", dev);
    cblbTokenInstance = await CBLB.deploy();
    await cblbTokenInstance.deployed();

    const CblbCheckin = await ethers.getContractFactory("CblbCheckin", dev);
    cblbCheckinInstance = await CblbCheckin.deploy(cblbTokenInstance.address);
    await cblbCheckinInstance.deployed();

    await cblbTokenInstance
      .connect(dev)
      .transferOwnership(cblbCheckinInstance.address);
  });

  it("Multi user checkin will send MATIC to contract(modified contract, freeCheckinIndex = 2 or 3 or 4 or 5)", async () => {
    let amountMaticRequire = await cblbCheckinInstance.getCheckinFee();
    console.log(
      "1st user checkin MATIC fee: ",
      parseFloat(ethers.utils.formatEther(amountMaticRequire))
    );
    await cblbCheckinInstance
      .connect(userA)
      .checkin({ value: amountMaticRequire });

    amountMaticRequire = await cblbCheckinInstance.getCheckinFee();
    console.log(
      "2nd user checkin MATIC fee: ",
      parseFloat(ethers.utils.formatEther(amountMaticRequire))
    );
    await cblbCheckinInstance
      .connect(userB)
      .checkin({ value: amountMaticRequire });

    amountMaticRequire = await cblbCheckinInstance.getCheckinFee();
    console.log(
      "3rd user checkin MATIC fee: ",
      parseFloat(ethers.utils.formatEther(amountMaticRequire))
    );
    await cblbCheckinInstance
      .connect(userC)
      .checkin({ value: amountMaticRequire });

    amountMaticRequire = await cblbCheckinInstance.getCheckinFee();
    console.log(
      "4th user checkin MATIC fee: ",
      parseFloat(ethers.utils.formatEther(amountMaticRequire))
    );
    await cblbCheckinInstance
      .connect(userD)
      .checkin({ value: amountMaticRequire });

    amountMaticRequire = await cblbCheckinInstance.getCheckinFee();
    console.log(
      "5th user checkin MATIC fee: ",
      parseFloat(ethers.utils.formatEther(amountMaticRequire))
    );
    await cblbCheckinInstance
      .connect(userE)
      .checkin({ value: amountMaticRequire });

    let contractEthBalance = await waffle.provider.getBalance(
      cblbCheckinInstance.address
    );

    console.log(
      "CblbCheckin contract MATIC balance",
      parseFloat(ethers.utils.formatEther(contractEthBalance))
    );

    expect(parseFloat(ethers.utils.formatEther(contractEthBalance))).to.equal(
      parseFloat(ethers.utils.formatEther(amountMaticRequire.mul(5)))
    );
  });

  it("Dev can withdraw MATIC from Checkin contract", async () => {
    // user checkin
    let amountMaticRequire = await cblbCheckinInstance.getCheckinFee();
    await cblbCheckinInstance
      .connect(userA)
      .checkin({ value: amountMaticRequire });

    let maticBalanceContractBefore = await waffle.provider.getBalance(
      cblbCheckinInstance.address
    );

    let maticBalanceUserABefore = await waffle.provider.getBalance(
      userA.address
    );

    let maticBalanceDevBefore = await waffle.provider.getBalance(dev.address);

    await cblbCheckinInstance.connect(dev).devWithdrawAcquiredFee();

    let maticBalanceContractAfter = await waffle.provider.getBalance(
      cblbCheckinInstance.address
    );
    let maticBalanceUserAAfter = await waffle.provider.getBalance(
      userA.address
    );

    let maticBalanceDevAfter = await waffle.provider.getBalance(dev.address);

    console.log(
      "Checkin Contract Matic balance before withdraw is: ",
      parseFloat(ethers.utils.formatEther(maticBalanceContractBefore))
    );
    console.log(
      "Checkin Contract Matic balance after withdraw is: ",
      parseFloat(ethers.utils.formatEther(maticBalanceContractAfter))
    );

    console.log(
      "UserA Matic balance before withdraw is: ",
      parseFloat(ethers.utils.formatEther(maticBalanceUserABefore))
    );
    console.log(
      "UserA Matic balance after withdraw is: ",
      parseFloat(ethers.utils.formatEther(maticBalanceUserAAfter))
    );

    console.log(
      "Dev Matic balance before withdraw is: ",
      parseFloat(ethers.utils.formatEther(maticBalanceDevBefore))
    );
    console.log(
      "Dev Matic balance after withdraw is: ",
      parseFloat(ethers.utils.formatEther(maticBalanceDevAfter))
    );

    expect(parseFloat(ethers.utils.formatEther(amountMaticRequire))).to.equal(
      parseFloat(
        ethers.utils.formatEther(
          maticBalanceContractBefore.sub(maticBalanceContractAfter)
        )
      )
    );
  });

  it("User can withdraw MATIC for dev", async () => {
    // user checkin
    let amountMaticRequire = await cblbCheckinInstance.getCheckinFee();
    await cblbCheckinInstance
      .connect(userA)
      .checkin({ value: amountMaticRequire });

    let maticBalanceContractBefore = await waffle.provider.getBalance(
      cblbCheckinInstance.address
    );

    let maticBalanceDevBefore = await waffle.provider.getBalance(dev.address);

    await cblbCheckinInstance.connect(userA).sendAcquireFeeToDev();

    let maticBalanceContractAfter = await waffle.provider.getBalance(
      cblbCheckinInstance.address
    );

    let maticBalanceDevAfter = await waffle.provider.getBalance(dev.address);

    console.log(
      "Dev Matic balance before withdraw is: ",
      parseFloat(ethers.utils.formatEther(maticBalanceDevBefore))
    );
    console.log(
      "Dev Matic balance after withdraw is: ",
      parseFloat(ethers.utils.formatEther(maticBalanceDevAfter))
    );

    console.log(
      "Checkin contract Matic balance before withdraw is: ",
      parseFloat(ethers.utils.formatEther(maticBalanceContractBefore))
    );
    console.log(
      "Checkin contract Matic balance after withdraw is: ",
      parseFloat(ethers.utils.formatEther(maticBalanceContractAfter))
    );

    expect(
      parseFloat(ethers.utils.formatEther(amountMaticRequire))
    ).to.be.equal(
      parseFloat(
        ethers.utils.formatEther(
          maticBalanceDevAfter.sub(maticBalanceDevBefore)
        )
      )
    );

    expect(
      parseFloat(ethers.utils.formatEther(amountMaticRequire))
    ).to.be.equal(
      parseFloat(
        ethers.utils.formatEther(
          maticBalanceContractBefore.sub(maticBalanceContractAfter)
        )
      )
    );
  });

  it("No user check-in, expect swap ratio should be 0", async () => {
    expect(await cblbCheckinInstance.getExpectedSwapRatio()).to.equal(0);
  });

  it("After user check-in, expect swap ratio should not be 0", async () => {
    let amountMaticRequire = await cblbCheckinInstance.getCheckinFee();
    await cblbCheckinInstance
      .connect(userA)
      .checkin({ value: amountMaticRequire });

    let totalFee = await cblbCheckinInstance.totalFee();
    console.log("Total fee: ", parseFloat(ethers.utils.formatEther(totalFee)));

    let expectSwapRatio = await cblbCheckinInstance.getExpectedSwapRatio();
    console.log(
      "Expect swap ratio: ",
      parseFloat(ethers.utils.formatEther(expectSwapRatio))
    );
    expect(expectSwapRatio).not.equal(0);
  });

  it("After userA check-in, checkinList should store proper index and userA address", async () => {
    let amountMaticRequire = await cblbCheckinInstance.getCheckinFee();
    await cblbCheckinInstance
      .connect(userA)
      .checkin({ value: amountMaticRequire });

    let checkinListAddress = await cblbCheckinInstance.checkinList(0);
    expect(checkinListAddress).to.equal(userA.address);
  });
});
