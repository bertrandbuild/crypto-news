import {ethers} from "hardhat";

async function main() {
  const oracleAddress: string = await deployOracle();
  await deployGpt(oracleAddress);
}

async function deployOracle(): Promise<string> {
  const oracle = await ethers.deployContract("Oracle", [], {});

  await oracle.waitForDeployment();

  console.log(
    `Oracle deployed to ${oracle.target}`
  );

  return oracle.target as string;
}

async function deployGpt(oracleAddress: string) {
  const agent = await ethers.deployContract("Gpt", [oracleAddress], {});

  await agent.waitForDeployment();

  console.log(
    `GPT deployed to ${agent.target}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
