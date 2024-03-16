import {ethers} from "hardhat";

async function main() {
  const oracleAddress: string = await deployOracle();
}

async function deployOracle(): Promise<string> {
  const oracle = await ethers.deployContract("Oracle", [], {});

  await oracle.waitForDeployment();

  console.log(
    `Oracle deployed to ${oracle.target}`
  );

  return oracle.target as string;
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
