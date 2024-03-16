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

export { getYtTranscript };
