import { Contract, TransactionReceipt } from "ethers";
const { ethers } = require("hardhat");
import fs from 'fs';
import path from 'path';
import {ABI} from "../contracts/abi";
import { GptRole } from "./start";

export interface GptQuery {
  content: string
  role: GptRole
  transactionHash?: string
}

function getId(receipt: TransactionReceipt, contract: Contract) {
  let id
  for (const log of receipt.logs) {
    try {
      const parsedLog = contract.interface.parseLog(log)
      if (parsedLog && parsedLog.name === "ChatCreated") {
        // Second event argument
        id = ethers.toNumber(parsedLog.args[1])
      }
    } catch (error) {
      // This log might not have been from your contract, or it might be an anonymous log
      console.log("Could not parse log:", log)
    }
  }
  return id;
}

async function getCallbackFromGaladriel(
  contract: Contract,
  id: number,
  currentCount: number
): Promise<any[]> {
  const queryHistory = await contract.getMessageHistoryContents(id)
  const roles = await contract.getMessageHistoryRoles(id)

  const newInsights: GptQuery[] = []
  queryHistory.forEach((message: any, i: number) => {
    if (i >= currentCount) {
      newInsights.push({
        role: roles[i],
        content: queryHistory[i]
      })
    }
  })
  return newInsights;
}

async function getFile(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

async function main() {
  const fileName = process.env.FILENAME;
  if (!fileName) {
    console.error('Please provide a filename as an argument');
    process.exit(1);
  }
    const filePath = path.join(process.cwd(), 'scripts', fileName);
    const transcript = await getFile(filePath);

    const contractAddress = process.env.GPT_CONTRACT_ADDRESS;
    const [signer] = await ethers.getSigners();
    const contract = new ethers.Contract(contractAddress, ABI, signer);

    // The custom GPT prompt
    let prompt = `Title: YouTube Video Transcript.`;
    prompt += `Analysis: Financial Market Insights and Psychological Recommendations.
      Objective: Analyze the provided transcript of a YouTube video focusing on finance.
      The video content may vary, encompassing structured market news, technical analysis, and/or market psychology recommendations.
      Additionally, evaluate the overall sentiment conveyed in the video to determine a "Fear and Greed Indicator" score.
    `;
    prompt += `Instructions: Read through the transcript carefully.
    Identify and differentiate between sections focused on market news and technical analysis.
    Summarize the key points as follows: Market News: Briefly list any major financial news items discussed, including relevant companies, economic indicators, or global events (3 to 5 bullet points). 
    Technical Analysis: Extract and list specific details mentioned, such as: Price targets for identified assets or securities. Support and resistance levels. Any mentioned technical indicators (e.g., moving averages, RSI levels), (3 to 5 bullet points).
    `;
    // For each key point, define the impact of the event between : "very bearish", "bearish", "neutral", "bullish", "very bullish".
    prompt += `Determine the Fear and Greed Indicator: Review the overall tone and content of the video.
    Assign a score from 0 (maximum fear) to 100 (maximum greed) based on the sentiment analysis of the video content.
    Consider the following factors: The urgency and tone in discussions of market news and events.
    The optimism or caution expressed in technical analysis. Recommendations that suggest fear or greed in market psychology.`;
    prompt += `Output Format: Provide your analysis in bullet points, clearly categorized under "Market_News", "Technical_Analysis" and conclude with the "Fear_and_Greed_Indicator" score.`;
    prompt += `Output Format: use a json format and reply with only the json.`;
    prompt += `Example Output: Market News: Discussed the recent Fed rate hike and its impact on tech stocks. Highlighted the earnings surprise from Company X, leading to a sharp stock price increase. Technical Analysis: Price target for Stock Y is set at $150, with current resistance at $145. Support for Currency Pair Z identified at 1.2500, with potential upside to 1.2650. Fear and Greed Indicator: 65 The score reflects moderate greed, influenced by optimistic price targets and positive market news coverage, balanced by cautionary advice on investment behavior.`;
    prompt += `Transcript: ${transcript}`;

    // Call the startGpt function
    const transactionResponse = await contract.startGpt(prompt);
    const receipt = await transactionResponse.wait()
    
    // Get the ID from transaction receipt logs
    let id = getId(receipt, contract);
    if (!id && id !== 0) {
      console.error("Could not get ID")
      return
    }
    
    if (receipt && receipt.status) {
      if (id) {
        while (true) {
          const newInsights: GptQuery[] = await getCallbackFromGaladriel(contract, id, 1);
          if (newInsights) {
            const lastMessage = newInsights.at(-1)
            if (lastMessage && lastMessage.role == "assistant") {
              console.log(lastMessage.content)
              break
            }
          }
          await new Promise(resolve => setTimeout(resolve, 2000))
        }
      }

    }

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });