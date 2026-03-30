from supadata import Supadata
from utils.url_parser import get_video_id
import os


#Generating the url transcript
def fetch_transcript(url):
    video_id = get_video_id(url)

    api_key = os.getenv("SUPADATA_API_KEY")
    supadata = Supadata(api_key=api_key)

    transcript = supadata.transcript(url=url, lang="en", text=True)
    full_text = transcript.content

    os.makedirs("transcripts_file", exist_ok=True)
    file_path = os.path.join("transcripts_file", f"{video_id}.txt")
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(full_text)

    return file_path, full_text
