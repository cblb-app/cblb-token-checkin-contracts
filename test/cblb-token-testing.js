const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CBLB token testing", function () {
  let user, owner;
  let cblbTokenInstance;
  beforeEach(async () => {
    // get specify account
    [user, owner] = await ethers.getSigners();

    const CBLB = await ethers.getContractFactory("CBLB", owner);
    cblbTokenInstance = await CBLB.deploy();
    await cblbTokenInstance.deployed();
  });

  it("After CBLB deployed, owner has 0 Cblb", async () => {
    let ownerCblbBalance = await cblbTokenInstance.balanceOf(owner.address);
    console.log("Owner CBLB balance is: ", ownerCblbBalance.toNumber());

    expect(ownerCblbBalance).to.equal(0);
  });

  it("After CBLB deployed, contract owner is proper configed", async () => {
    let ownerAddress = await cblbTokenInstance.owner();
    console.log("Owner address is: ", ownerAddress);
    expect(ownerAddress).to.equal(owner.address);
  });

  it("Owner can mint exact amount CBLB", async () => {
    await cblbTokenInstance.connect(owner).mint(user.address, 100);
    let userCblbBalance = await cblbTokenInstance.balanceOf(user.address);
    console.log("User CBLB balance is: ", userCblbBalance.toNumber());
    expect(userCblbBalance).to.equal(100);
  });

  it("User can not mint CBLB", async () => {
    await expect(
      cblbTokenInstance.connect(user).mint(owner.address, 100)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Owner can tranfer ownership to user", async () => {
    await cblbTokenInstance.connect(owner).transferOwnership(user.address);
    let ownerAddress = await cblbTokenInstance.owner();
    console.log("Owner address is: ", ownerAddress);
    expect(ownerAddress).to.equal(user.address);
  });
});
