from youtube_transcript_api import YouTubeTranscriptApi
from youtube_transcript_api.proxies import WebshareProxyConfig
from utils.url_parser import get_video_id
import os



#Generating the url transcript
def fetch_transcript(url):
    video_id= get_video_id(url)

    proxy_username = os.getenv("WEBSHARE_USERNAME")
    proxy_password = os.getenv("WEBSHARE_PASSWORD")

    if proxy_username and proxy_password:
        ytt_api = YouTubeTranscriptApi(
            proxy_config=WebshareProxyConfig(
                proxy_username=proxy_username,
                proxy_password=proxy_password,
            )
        )
    else:
        ytt_api = YouTubeTranscriptApi()

    transcript= ytt_api.fetch(video_id , languages=['en', 'hi'])
    full_text = " ".join([snippet.text for snippet in transcript])

    os.makedirs("transcripts_file", exist_ok=True)
    file_path= os.path.join("transcripts_file" , f"{video_id}.txt")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(full_text)

    return file_path,full_text
