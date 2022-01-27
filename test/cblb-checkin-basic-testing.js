const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Checkin contract basic testing", function () {
  let userA, userB, dev;
  let cblbTokenInstance;
  let cblbCheckinInstance;

  beforeEach(async () => {
    [userA, userB, dev] = await ethers.getSigners();

    const CBLB = await ethers.getContractFactory("CBLB", dev);
    cblbTokenInstance = await CBLB.deploy();
    await cblbTokenInstance.deployed();

    const CblbCheckn = await ethers.getContractFactory("CblbCheckin", dev);
    cblbCheckinInstance = await CblbCheckn.deploy(cblbTokenInstance.address);
    await cblbCheckinInstance.deployed();

    await cblbTokenInstance
      .connect(dev)
      .transferOwnership(cblbCheckinInstance.address);
  });

  it("Cblb owner transfer to cblbCheckin contract", async () => {
    expect(await cblbTokenInstance.owner()).to.equal(
      cblbCheckinInstance.address
    );
  });

  it("UserA can checkIn", async () => {
    let amountMaticRequire = await cblbCheckinInstance.getCheckinFee();
    await cblbCheckinInstance
      .connect(userA)
      .checkin({ value: amountMaticRequire });
    let cblberCheckinCount = await cblbCheckinInstance.cblberInfo(
      userA.address
    );
    expect(cblberCheckinCount.checkinCount).to.equal(1);
  });

  it("UserA twice check-in within one day should revert", async () => {
    let checkinFee = await cblbCheckinInstance.connect(userA).getCheckinFee();
    await cblbCheckinInstance.connect(userA).checkin({ value: checkinFee });
    let gap = await cblbCheckinInstance.getCheckinGap();
    console.log(gap.toNumber());
    await expect(cblbCheckinInstance.connect(userA).checkin()).to.revertedWith(
      "[CblbCheckn.sol]: CHECK IN GAP NEED MORE THAN ONE DAY"
    );
  });

  it("Multi user check-in should get proper totalCheckin count", async () => {
    let checkinFee = await cblbCheckinInstance.connect(userA).getCheckinFee();
    await cblbCheckinInstance.connect(userA).checkin({ value: checkinFee });
    await cblbCheckinInstance.connect(userB).checkin({ value: checkinFee });

    expect(await cblbCheckinInstance.totalCheckin()).to.equal(2);
  });

  it("No user check-in, check-in fee should const value", async () => {
    expect(await cblbCheckinInstance.getCheckinFee()).not.equal(0);
  });

  it("Multi user check-in, check-in fee should const", async () => {
    let amountMaticRequireUserA = await cblbCheckinInstance.getCheckinFee();
    await cblbCheckinInstance
      .connect(userA)
      .checkin({ value: amountMaticRequireUserA });

    let amountMaticRequireUserB = await cblbCheckinInstance.getCheckinFee();
    await cblbCheckinInstance
      .connect(userB)
      .checkin({ value: amountMaticRequireUserB });

    expect(amountMaticRequireUserA).to.equal(amountMaticRequireUserB);
  });

  it("UserA check-in should get CBLB", async () => {
    let amountMaticRequire = await cblbCheckinInstance.getCheckinFee();
    await cblbCheckinInstance
      .connect(userA)
      .checkin({ value: amountMaticRequire });
    expect(await cblbTokenInstance.balanceOf(userA.address)).to.equal(
      await cblbCheckinInstance.getCblbIssueAmount(0)
    );
  });

  it("UserA check-in, UserB do check-in follow up, UserA CBLB balance should greater than UserB", async () => {
    let checkinFee = await cblbCheckinInstance.getCheckinFee();
    await cblbCheckinInstance.connect(userA).checkin({ value: checkinFee });

    await cblbCheckinInstance.connect(userB).checkin({ value: checkinFee });

    let userACblbBalance = await cblbTokenInstance.balanceOf(userA.address);
    let userBCblbBalance = await cblbTokenInstance.balanceOf(userB.address);

    expect(
      parseFloat(ethers.utils.formatEther(userACblbBalance))
    ).to.be.greaterThan(parseFloat(ethers.utils.formatEther(userBCblbBalance)));
    console.log(
      "UserA CBLB balance is: ",
      parseFloat(ethers.utils.formatEther(userACblbBalance))
    );
    console.log(
      "UserB CBLB balance is: ",
      parseFloat(ethers.utils.formatEther(userBCblbBalance))
    );
  });
});
