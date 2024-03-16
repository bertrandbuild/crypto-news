// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getYtTranscript } from '../../scripts/callApi'; // Update the path as needed

type Data = {
  transcript?: string;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.method === 'GET') {
    const videoId = req.query.videoId as string;
    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    try {
      const transcript = await getYtTranscript(videoId);
      res.status(200).json({ transcript });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
