import { Contract, TransactionReceipt } from "ethers";
const { ethers } = require("hardhat");
import {ABI} from "../contracts/abi";

export interface GptQuery {
  content: string
  role: GptRole
  transactionHash?: string
}
export type GptRole = 'assistant' | 'user' | 'system'

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

async function main() {
    const contractAddress = process.env.GPT_CONTRACT_ADDRESS;
    const [signer] = await ethers.getSigners();
    const contract = new ethers.Contract(contractAddress, ABI, signer);
    // TODO: get real transcript
    const transcript = `il défend not droit de fumer tout autant qu'il défend notre droit d'acheter Bitcoin c'est l'allégation du PDG de JP Morgan qui montre encore une fois sa détermination à ne pas être pro bitcoiner à ne pas aimer Bitcoin il le montre et même dans génér toutes les cryptonnaaies et pourtant c'est sa justification pour expliquer pourquoi JP Morgan son institution va de plus en plus vers la cryptoonnaie et la blockchain en tant que tel ce qui est intéressant de voir surtout c'est la différence entre le positionnement de JP Morgan et son CEO et son PDG et à côté le positionnement du CEO de Black Rock que l'on retrouve d'ailleurs dans les articles les plus lus juste en bas le Bitcoin est plus grand que n'importe quel gouvernement ça c'est le positionnement du CEO de Black Rock qui a lancé ses ETF justement BTC on va en parler tout à l'heure bonjour C'est cryptol j'espère que vous allez bien en ce 13 mars 2024 on se retrouve aujourd'hui pour forcément parler cryptoonné pour parler Bitcoin on va faire un tour sur l'actualité ensuite on va aller sur les graphiqu pour comprendre ce qui s'est passé hier et qu'on a eu un gros closur de liquidation on a une belle opportunité d'achat on va revenir sur toute cette partielà mais avant tout il était important de rappeler le positionnement de JP Morgan en gros on avance à reculon au niveau de Bitcoin alors c'est en tout cas l'image qu'il a l'image qui veut donner impérativement et pourtant quand on regarde ce qui se passe en réalité on sait très bien que JP Morgan avance très très rapidement sur la blockchain avance très rapidement sur la cryptoonnaie et on sait très bien qu'il y a eu énormément de manipulation avec les prises de parole et les prises de position de Jamie Diamond sur différents stocks mais aussi sur le Bitcoin on connaît très bien ça je vous ai déjà fait une vidéo samedi dessus à côté nous avons coin share qui quant à lui se dit qu'en effet les ETF sont quand même bien sympas et il est en train d'acheter la partie ETF du géant Valkyrie très important pour pouvoir s'étendre au US ça à savoir que la complexité de la création des ETF c'est pas tant la complexité technique c'est la complexité de réglementation rien de mieux que d'acheter la partie qui est déjà réglementée et qui est autorisée à pouvoir exécuter des ETF mais concrètement si on reprend et qu'on continue à parler de Bitcoin que représente le TF Valkyrie dedans si on regarde hop on va se déplacer ici on voit que c'est pas grand-chose he c'est à peu près 5000 6000 Bitcoin donc c'est vraiment très très faible par rapport à ce que l'on connaît Valkyrie c'est la petite ligne bleu foncé que vous voyez ici hein vraiment toute petite quand on compare en fait tout le reste et oui les ETF prennent de plus en plus de place on a dépassé les 10 milliards d'inflow donc de nouvelle liquidité qui achète du Bitcoin grâce aux ETF et on est à 58 milliards de capitalisation totale quand on regarde les journées de lundi et la journée d'hier c'est très intéressant de voir que on continue à être dans un flux positif 300 millions pour lundi 400 millions pour hier pour mardi très important de noter qu'on a toujours greskel qui est en train de liquider 285 millions et 539 MLI on c'est énorme et quand on regarde en fait la la vitesse à laquelle ça diminue on était sur un Black Rock pour rappel qui était à 600000 BTC qui se retrouve maintenant à 389000 et jusqu'à quand ils peuvent continuer à vendre combien de temps ça va prendre pour que en fait la pression baissière amenée par greskel s'arrête`;

    // The custom GPT prompt
    let prompt = `Title: YouTube Video Transcript.`;
    prompt += `Analysis: Financial Market Insights and Psychological Recommendations.
      Objective: Analyze the provided transcript of a YouTube video focusing on finance.
      The video content may vary, encompassing structured market news, technical analysis, and/or market psychology recommendations.
      Additionally, evaluate the overall sentiment conveyed in the video to determine a "Fear and Greed Indicator" score.
    `;
    prompt += `Instructions: Read through the transcript carefully.
    Identify and differentiate between sections focused on market news and technical analysis.
    Summarize the key points as follows: Market News: Briefly list any major financial news items discussed, including relevant companies, economic indicators, or global events.
    Technical Analysis: Extract and list specific details mentioned, such as: Price targets for identified assets or securities. Support and resistance levels. Any mentioned technical indicators (e.g., moving averages, RSI levels).`;
    prompt += `Determine the Fear and Greed Indicator: Review the overall tone and content of the video.
    Assign a score from 0 (maximum fear) to 100 (maximum greed) based on the sentiment analysis of the video content.
    Consider the following factors: The urgency and tone in discussions of market news and events.
    The optimism or caution expressed in technical analysis. Recommendations that suggest fear or greed in market psychology.`;
    prompt += `Output Format: Provide your analysis in bullet points, clearly categorized under "Market News", "Technical Analysis" and conclude with the "Fear and Greed Indicator" score.`;
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