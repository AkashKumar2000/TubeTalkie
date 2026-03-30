import sys
import os 

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__),"..","rag")))

from dotenv import load_dotenv
load_dotenv(os.path.join(os.path.dirname(__file__),"..",".env"))

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from pydantic import BaseModel

from transcript.fetcher import fetch_transcript
from vectorstore.embedder import embed_transcript
from chain.qa_chain import answer_question

app= FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"]
)

video_stores={}

class LoadRequest(BaseModel):
    url:str

class ChatRequest(BaseModel):
    video_id:str
    question:str

@app.post("/load")
def load_video(req:LoadRequest):
    try:
        file_path , full_text= fetch_transcript(req.url)
        vector_store = embed_transcript(file_path)

        video_id = os.path.splitext(os.path.basename(file_path))[0]
        video_stores[video_id]= vector_store

        return {"status":"ready", "video_id":video_id}
    except Exception as e:
        raise HTTPException(status_code=400 , detail=str(e))

@app.post("/chat")
def chat(req:ChatRequest):
    vector_store= video_stores.get(req.video_id)

    if not vector_store:
        raise HTTPException(status_code=404 , detail="Video not loaded. Call /load first")
    
    try:
        answer= answer_question(req.question , vector_store)
        return {"answer":answer}
    except Exception as e:
        raise HTTPException(status_code=500 , detail=str(e))

@app.get("/health")
def health():
    return {"status": "Ok"}

# uvicorn backend.main:app --reload --port 8000
# Serve frontend static files
frontend_path = os.path.join(os.path.dirname(__file__), "..", "frontend")
app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")