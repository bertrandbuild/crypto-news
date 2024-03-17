const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("FileStorage", function () {
  let fileStorage, owner, user1, user2, fee;

  // Deploy the contract
  before(async function () {
    const fileStorage = await ethers.deployContract('FileStorage', [ethers.parseEther("0.0001")]);
    await fileStorage.waitForDeployment();

    // Get signers
    [owner, user1, user2] = await ethers.getSigners();
  });

  it("Should allow a user to add a file", async function () {
    const fileId = 1;
    const transcriptCid = "transcriptCidExample";
    const analysisCid = "analysisCidExample";

    // User1 adds a file
    await expect(fileStorage.connect(user1).addFile(fileId, transcriptCid, analysisCid))
      .to.emit(fileStorage, "FileAdded")
      .withArgs(fileId, transcriptCid, analysisCid, user1.address);
  });

  it("Should allow another user to pay the fee and access the file info", async function () {
    const fileId = 1;

    // User2 pays the fee to access the file info added by User1
    const transaction = await fileStorage.connect(user2).getFile(fileId, { value: fee });
    await expect(transaction)
      .to.emit(fileStorage, "FileInfoAccessed")
      .withArgs(fileId, "transcriptCidExample", "analysisCidExample", user2.address);

    // Verify the transfer to the first user
    await expect(() => transaction)
      .to.changeEtherBalances([user2, user1], [fee.mul(-1), fee]);
  });

});
