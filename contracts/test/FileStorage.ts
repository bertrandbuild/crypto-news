const { expect } = require("chai");
const { ethers } = require("hardhat");
import {Signer, BigNumberish } from "ethers";


describe("FileStorage", function () {
  let fileStorage: any;
  let owner: Signer;
  let user1: Signer;
  let user2: Signer;
  let fee: BigNumberish;

  // Deploy the contract
  before(async function () {
    // AQUÍ ESTÁ EL PROBLEMA:
    //const fileStorage = await ethers.deployContract('FileStorage', [ethers.parseEther("0.0001")]);
    // Aquí debes asignar el contrato desplegado a la variable fileStorage, no declarar una nueva variable
    fileStorage = await ethers.deployContract('FileStorage', [ethers.parseEther("0.0001")]);
   
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
      .withArgs(fileId, transcriptCid, analysisCid, user1.getAddress());
  });

  it("Should allow another user to pay the fee and access the file info", async function () {
    const fileId = 1;

    // User2 pays the fee to access the file info added by User1
    const transaction = await fileStorage.connect(user2).getFile(fileId, { value: fee });
    await expect(transaction)
      .to.emit(fileStorage, "FileInfoAccessed")
      .withArgs(fileId, "transcriptCidExample", "analysisCidExample", user2.getAddress());

      //const fee: BigNumber = ethers.BigNumber.from(100); // Por ejemplo

      
      const feeNum = ethers.utils.parseEther("0.01");
      

    // Verify the transfer to the first user
    await expect(() => transaction)
    .to.changeEtherBalances([user2, user1], [feeNum * -1, feeNum]);
  });

  it("Should create a table upon deployment", async function () {
    const tableId = await fileStorage.getTableId();
    expect(tableId).to.not.equal(0);
  });

  it("Should allow updating a file entry", async function () {
    const fileId = 1;
    const updatedTranscriptCid = "updatedTranscriptCid";
    const updatedAnalysisCid = "updatedAnalysisCid";
  
    // Update the file entry
    await expect(fileStorage.updateTable(fileId, updatedTranscriptCid, updatedAnalysisCid))
      .withArgs(fileId, updatedTranscriptCid, updatedAnalysisCid);
  });

  it("Should allow deleting a file entry", async function () {
    const fileId = 1;
  
    // Delete the file entry
    await expect(fileStorage.deleteFromTable(fileId))
      .withArgs(fileId);
  
    // Try to access the deleted entry and verify it's deleted
    const fileInfo = await fileStorage.fileInfoMap(fileId);
    expect(fileInfo.transcriptCid).to.equal("");
    expect(fileInfo.analysisCid).to.equal("");
  });

});
