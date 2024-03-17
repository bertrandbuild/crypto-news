import path from "path";
import fs from 'fs';

const { exec } = require('child_process');

function getYtTranscript(videoId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    exec(`python3 scripts/get_transcript.py ${videoId}`, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
        reject(new Error(`Execution error: ${error.message}`));
        return;
      }
      if (stderr) {
        console.error(stderr);
        reject(new Error(`Script error: ${stderr}`));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

function getSummarizedTranscript(transcript: string): Promise<string> {
  // shorten the transcript to about 10,000 characters to avoid hitting the max gas limit
  transcript = transcript.slice(0, 11000); // TODO: handle longer transcripts
  const filePath = path.join(process.cwd(), './contracts/scripts/input.txt');
  console.log(transcript.length);
  fs.writeFile(filePath, transcript, (err) => {
    if (err) {
      console.error(err);
      return;
    }
  });

  return new Promise((resolve, reject) => {
    exec(`cd  ./contracts && npm run gpt-text`, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
        reject(new Error(`Execution error: ${error.message}`));
        return;
      }
      if (stderr) {
        console.error(stderr);
        reject(new Error(`Script error: ${stderr}`));
        return;
      }
      resolve(stdout.trim());
    });
  });
}

export { getYtTranscript, getSummarizedTranscript };
