// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getYtTranscript } from '../../utils/callApi'; // Update the path as needed
import { postToIPFS } from 'utils/ipfs';
import * as testTranscript from './data.json';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === 'GET') {
    const videoId = req.query.videoId as string;
    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    try {
      const isDev = true;
      const transcript = (isDev) ? testTranscript : await getYtTranscript(videoId);
      // store on ipfs original transcript
      const uri = await postToIPFS(
        JSON.stringify({ transcript }),
      );
      console.log(uri);
      // TODO: query galadriel for a summary
      // TODO: store on ipfs summary
      // TODO: store onchain the map
      res.status(200).json({ uri });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
