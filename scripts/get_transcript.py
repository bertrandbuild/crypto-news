import sys
from youtube_transcript_api import YouTubeTranscriptApi

def fetch_transcript(video_id):
    try:
        # Fetching the transcript for the given video ID
        transcript = YouTubeTranscriptApi.get_transcript(video_id)
        print_transcript(transcript)
    except Exception as e:
        print(f"An error occurred: {e}")

def print_transcript(transcript):
    # Iterating through the transcript list and printing the text
    for entry in transcript:
        print(f"Time: {entry['start']} - Text: {entry['text']}")

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python api.py <YouTube Video ID>")
    else:
        video_id = sys.argv[1]
        fetch_transcript(video_id)
