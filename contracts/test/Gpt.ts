import {loadFixture,} from "@nomicfoundation/hardhat-toolbox/network-helpers";
import {expect} from "chai";
import {ethers} from "hardhat";

describe("Gpt", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deploy() {
    // Contracts are deployed using the first signer/account by default
    const allSigners = await ethers.getSigners();
    const owner = allSigners[0];

    const Oracle = await ethers.getContractFactory("Oracle");
    const oracle = await Oracle.deploy();

    const Gpt = await ethers.getContractFactory("Gpt");
    const gpt = await Gpt.deploy("0x0000000000000000000000000000000000000000");

    return {gpt, oracle, owner, allSigners};
  }

  describe("Deployment", function () {
    it("User can start chat", async () => {
      const {gpt, oracle, owner} = await loadFixture(deploy);
      await gpt.setOracleAddress(oracle.target);

      await gpt.startGpt("Hello");
      // promptId: 0, callbackId: 0
      const messages = await oracle.getMessages(0, 0)
      expect(messages.length).to.equal(1)
      expect(messages[0]).to.equal("Hello")
    });
    it("Oracle can add response", async () => {
      const {
        gpt,
        oracle,
        owner,
        allSigners
      } = await loadFixture(deploy);
      const oracleAccount = allSigners[6];
      await gpt.setOracleAddress(oracle.target);
      await oracle.updateWhitelist(oracleAccount, true);

      await gpt.startGpt("Hello");
      await oracle.connect(oracleAccount).addResponse(0, 0, "Hi", "");
      const messages = await oracle.getMessages(0, 0)
      expect(messages.length).to.equal(2)
      expect(messages[1]).to.equal("Hi")
    });
    it("User can add message", async () => {
      const {
        gpt,
        oracle,
        owner,
        allSigners
      } = await loadFixture(deploy);
      const oracleAccount = allSigners[6];
      await gpt.setOracleAddress(oracle.target);
      await oracle.updateWhitelist(oracleAccount, true);

      await gpt.startGpt("Hello");
      await oracle.connect(oracleAccount).addResponse(0, 0, "Hi", "");
      await gpt.addMessage("message", 0);

      const messages = await oracle.getMessages(0, 0)
      expect(messages.length).to.equal(3)
      expect(messages[2]).to.equal("message")
    });
  });
  describe("Error handling", function () {
    it("User cannot start chat and add another message", async () => {
      const {gpt, oracle, owner} = await loadFixture(deploy);
      await gpt.setOracleAddress(oracle.target);

      await gpt.startGpt("Hello");
      await expect(
        gpt.addMessage("message", 0)
      ).to.be.revertedWith("No response to previous message");
    });
    it("Oracle cannot add 2 responses", async () => {
      const {gpt, oracle, allSigners} = await loadFixture(deploy);
      const oracleAccount = allSigners[6];
      await gpt.setOracleAddress(oracle.target);
      await oracle.updateWhitelist(oracleAccount, true);

      await gpt.startGpt("Hello");
      await oracle.connect(oracleAccount).addResponse(0, 0, "Hi", "");
      await expect(
        oracle.connect(oracleAccount).addResponse(0, 0, "Hi", "")
      ).to.be.revertedWith("Prompt already processed");
    });
    it("Oracle cannot add 2 responses", async () => {
      const {
        gpt,
        oracle,
        allSigners,
        owner
      } = await loadFixture(deploy);
      const oracleAccount = allSigners[6];
      await gpt.setOracleAddress(oracle.target);
      await oracle.updateWhitelist(oracleAccount, true);

      await gpt.startGpt("Hello");
      await oracle.connect(oracleAccount).addResponse(0, 0, "Hi", "");

      // Ultimate edge-case, user whitelisted some random address
      const randomAccount = allSigners[7];
      await gpt.setOracleAddress(randomAccount);

      await expect(
        gpt.connect(randomAccount).onOracleLlmResponse(0, "Hi", "")
      ).to.be.revertedWith("No message to respond to");
    });

  })
});
