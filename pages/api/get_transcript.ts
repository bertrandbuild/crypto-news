// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { getYtTranscript } from '../../utils/callApi'; // Update the path as needed
import * as testTranscript from './data.json';

function cleanupTranscript(transcript) {
  // Use a regular expression to remove the "Time: [timestamp] - Text: " part from each line
  const cleanedTranscript = transcript.replace(/Time: \d+\.\d+ - Text: /g, '').replace(/\n/g, ' ');
  return cleanedTranscript;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<any>
) {
  if (req.method === 'GET') {
    const videoId = req.query.videoId as string;
    if (!videoId) {
      return res.status(400).json({ error: 'Video ID is required' });
    }

    // const isDev = process.env.NODE_ENV === 'development';
    const isDev = false;
    try {
      const transcript = (isDev) ? testTranscript.transcript : await getYtTranscript(videoId);
      const cleanedTranscript = cleanupTranscript(transcript);
      res.status(200).json(cleanedTranscript);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } else {
    // Handle any other HTTP method
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
