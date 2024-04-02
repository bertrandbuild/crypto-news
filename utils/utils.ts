function extractVideoId(input) {
  // Check if input is directly a video ID (assuming video IDs are 11 characters long and do not contain special URL characters)
  if (input.length === 11 && !input.includes('/') && !input.includes('?') && !input.includes('&')) {
      return input;
  }

  // Attempt to handle the input as a URL
  try {
      const url = new URL(input.startsWith('http://') || input.startsWith('https://') ? input : `https://${input}`);
      const urlParams = new URLSearchParams(url.search);
      const videoId = urlParams.get('v');

      if (videoId) {
          return videoId;
      }

      // In some cases, the video ID might be part of the pathname for certain URL formats, e.g., "https://youtu.be/Dwb4u8my4vg"
      const pathSegments = url.pathname.split('/').filter(Boolean); // Remove any empty strings due to leading or trailing slashes
      if (pathSegments.length && pathSegments[0].length === 11) {
          return pathSegments[0];
      }
  } catch (error) {
      console.error("Error parsing input:", error);
  }

  return null; // Return null if the video ID couldn't be determined
}

function extractAndParseJSON(input) {
  const jsonMatch = input.match(/```json\n([\s\S]*?)\n```/);
  if (jsonMatch && jsonMatch[1]) {
      try {
          const jsonData = JSON.parse(jsonMatch[1]);
          return jsonData;
      } catch (e) {
          console.error("Failed to parse JSON:", e);
      }
  } else {
      console.error("No JSON found in the input");
  }
}

function getTranscript(videoId) {
  const endpoint = `https://3k1x93u5kg.execute-api.eu-west-1.amazonaws.com/api/get_transcript?videoId=${videoId}`;
  return fetch(endpoint)
    .then(async response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const text = await response.text();
      return text;
    })
    .then(data => {
      return data;
    })
    .catch(error => {
      console.error('There was a problem with your fetch operation:', error);
      throw error;
    });
}

function getSummarizedTranscript(transcript) {
  const endpoint = `http://localhost:3000/api/get_summarized_ai`;
  return fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ transcript: transcript })
  })
  .then(response => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(data => {
    data = extractAndParseJSON(data.summarizedTranscript);
    return data;
  })
  .catch(error => {
    console.error('There was a problem with your fetch operation:', error);
    throw error;
  });
}


export { getTranscript, extractVideoId, getSummarizedTranscript };

