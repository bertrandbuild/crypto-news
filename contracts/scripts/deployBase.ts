import { ethers } from 'hardhat';

async function main() {
  const fileStorage = await ethers.deployContract('FileStorage', [ethers.parseEther("0.0001")]);

  await fileStorage.waitForDeployment();

  console.log('fileStorage Contract Deployed at ' + fileStorage.target);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});