import sys
import os
sys.path.append(os.path.dirname(__file__))

from dotenv import load_dotenv
load_dotenv()

from transcript.fetcher import fetch_transcript
from chain.qa_chain import answer_question
from utils.url_parser import get_video_id
from vectorstore.embedder import embed_transcript

url = input("Enter youtbe URL ")
file_path , full_text = fetch_transcript(url)
vector_store= embed_transcript(file_path)

while(True):

    question= str(input("Ask your question"))
    if question=="exit":
        break

    answer= answer_question(question , vector_store)
    print(answer)
