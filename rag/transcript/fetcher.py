from youtube_transcript_api import YouTubeTranscriptApi
from utils.url_parser import get_video_id
import os



#Generating the url transcript
def fetch_transcript(url):
    video_id= get_video_id(url)

    cookies_path = os.path.join(os.path.dirname(__file__), "..", "..", "cookies.txt")
    ytt_api = YouTubeTranscriptApi(cookies=cookies_path if os.path.exists(cookies_path) else None)
    transcript= ytt_api.fetch(video_id , languages=['en', 'hi'])
    full_text = " ".join([snippet.text for snippet in transcript])

    os.makedirs("transcripts_file", exist_ok=True)
    file_path= os.path.join("transcripts_file" , f"{video_id}.txt")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(full_text)

    return file_path,full_text
