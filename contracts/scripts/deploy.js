const hre = require("hardhat");

async function main() {
  console.log("Deploying VotingContract...");

  // Get the ContractFactory and Signers here.
  const VotingContract = await hre.ethers.getContractFactory("VotingContract");
  
  // Deploy the contract
  const votingContract = await VotingContract.deploy();
  
  await votingContract.waitForDeployment();
  
  const contractAddress = await votingContract.getAddress();
  
  console.log("VotingContract deployed to:", contractAddress);
  console.log("Deployer address:", await votingContract.owner());
  
  // Save the contract address and ABI for frontend integration
  const fs = require('fs');
  const contractInfo = {
    address: contractAddress,
    abi: VotingContract.interface.format('json')
  };
  
  fs.writeFileSync(
    '../src/contracts/VotingContract.json',
    JSON.stringify(contractInfo, null, 2)
  );
  
  // Verify contract on Etherscan (if not localhost)
  if (hre.network.name !== "localhost" && hre.network.name !== "hardhat") {
    console.log("Waiting for block confirmations...");
    await votingContract.deploymentTransaction().wait(6);
    
    console.log("Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: contractAddress,
        constructorArguments: [],
      });
      console.log("Contract verified on Etherscan");
    } catch (error) {
      console.log("Error verifying contract:", error.message);
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });