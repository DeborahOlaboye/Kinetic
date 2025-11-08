const hre = require("hardhat");

async function main() {
  console.log("Deploying RecipientSplitterFactory...");

  const RecipientSplitterFactory = await hre.ethers.getContractFactory("RecipientSplitterFactory");
  const factory = await RecipientSplitterFactory.deploy();

  await factory.waitForDeployment();

  const address = await factory.getAddress();
  console.log("RecipientSplitterFactory deployed to:", address);

  // Wait for block confirmations before verifying
  console.log("Waiting for block confirmations...");
  await factory.deploymentTransaction().wait(6);

  // Verify on Etherscan
  console.log("Verifying contract on Etherscan...");
  try {
    await hre.run("verify:verify", {
      address: address,
      constructorArguments: [],
    });
    console.log("Contract verified on Etherscan!");
  } catch (error) {
    console.log("Verification failed:", error.message);
  }

  console.log("\n==============================================");
  console.log("Deployment complete!");
  console.log("==============================================");
  console.log("\nUpdate your .env file with:");
  console.log(`VITE_SPLITTER_FACTORY_ADDRESS=${address}`);
  console.log("\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
