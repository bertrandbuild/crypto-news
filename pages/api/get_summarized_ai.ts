// // Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// import type { NextApiRequest, NextApiResponse } from 'next';
// import { getSummarizedTranscript } from '../../utils/callApi'; // Update the path as needed

// export default async function handler(
//   req: NextApiRequest,
//   res: NextApiResponse<any>
// ) {
//   if (req.method === 'POST') {
//     // Ensure the Content-Type is application/json
//     if (req.headers['content-type'] !== 'application/json') {
//       res.status(400).json({ error: 'Please send the request with Content-Type: application/json' });
//       return;
//     }

//     const { transcript } = req.body;

//     if (!transcript) {
//       res.status(400).json({ error: 'transcript is missing in the request body' });
//       return;
//     }

//     const summarizedTranscript = await getSummarizedTranscript(transcript);

//     res.status(200).json({ summarizedTranscript });
//   } else {
//     // Handle other HTTP methods or return an error
//     res.setHeader('Allow', ['POST']);
//     res.status(405).end(`Method ${req.method} Not Allowed`);
//   }
// }
