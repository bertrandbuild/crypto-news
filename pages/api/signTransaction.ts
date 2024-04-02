// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { ethers } from 'ethers';

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse<any>
    ) {
        if (req.method === 'POST') {
            // FIXME: right now this file is not working and the transaction is signed in the frontend (not good)
            try {
            // In a real application, the private key should be securely fetched from an environment variable or secret management service
            const privateKey = process.env.PRIVATE_KEY;
            const provider = new ethers.providers.JsonRpcProvider(
                process.env.INFURA_URL + process.env.INFURA_ID
            );
            const wallet = new ethers.Wallet(privateKey, provider);

            // Transaction data could be sent in the request body
            const { to, value } = req.body;

            const tx = {
                to: to,
                value: ethers.utils.parseEther(value.toString()),
                // Add other transaction fields as necessary
            };

            const txResponse = await wallet.sendTransaction(tx);
            const receipt = await txResponse.wait();

            res.status(200).json({ success: true, transactionHash: txResponse.hash, receipt: receipt });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, error: error.message });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).end(`Method ${req.method} Not Allowed`);
    }
}
