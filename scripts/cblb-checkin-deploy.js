// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy

  const [deployer] = await ethers.getSigners();

  console.log("Deploying contract with wallet: ", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  const CblbCheckin = await hre.ethers.getContractFactory(
    "CblbCheckin",
    deployer
  );
  const cblbCheckinInstance = await CblbCheckin.deploy(
    "0x7a45922F95C845Ff9bE01112AfCF207968a9cA0B" // CBLB TOKEN CONTRACT ADDRESS
  );

  await cblbCheckinInstance.deployed();

  console.log(
    "CBLB Checkin contract deployed to:",
    cblbCheckinInstance.address
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
