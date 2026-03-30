# TubeTalkie

Ask anything about any YouTube video. Paste a URL, load the video, and chat with it.

![TubeTalkie](https://img.shields.io/badge/built%20with-FastAPI%20%2B%20LangChain%20%2B%20Groq-blue)

---

## What it does

1. You paste a YouTube video URL
2. TubeTalkie fetches the transcript, chunks it, and stores it in a vector database
3. You ask questions — it finds the most relevant parts of the transcript and answers using an LLM

---

## Tech Stack

| Layer | Technology |
|---|---|
| LLM | Groq (`llama-3.1-8b-instant`) |
| Embeddings | HuggingFace `all-MiniLM-L6-v2` (local) |
| Vector Store | FAISS |
| Orchestration | LangChain |
| Backend | FastAPI + Uvicorn |
| Frontend | Plain HTML / CSS / JS |
| Extension | Chrome (Manifest V3, Side Panel) |

---

## Project Structure

```
TubeTalkie/
├── rag/                        # Core RAG pipeline
│   ├── main.py                 # CLI entry point
│   ├── transcript/fetcher.py   # Fetch YouTube transcript
│   ├── vectorstore/embedder.py # Embed & store in FAISS
│   ├── chain/qa_chain.py       # LangChain RAG chain
│   └── utils/url_parser.py     # Extract video ID from URL
├── backend/
│   └── main.py                 # FastAPI server + static file serving
├── frontend/
│   ├── index.html
│   ├── app.js
│   └── style.css
├── extension/                  # Chrome extension (side panel)
│   ├── manifest.json
│   ├── background.js
│   ├── popup.html
│   ├── popup.js
│   └── style.css
├── Dockerfile
├── requirements.txt
└── .env                        # Not committed — see setup below
```

---

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/AkashKumar2000/TubeTalkie.git
cd TubeTalkie
```

### 2. Create a virtual environment

```bash
python -m venv venv
source venv/Scripts/activate   # Windows
source venv/bin/activate        # Mac/Linux
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Create a `.env` file

```
GROQ_API_KEY=your_groq_api_key
WEBSHARE_USERNAME=your_webshare_proxy_username
WEBSHARE_PASSWORD=your_webshare_proxy_password
```

- Get a free Groq API key at [console.groq.com](https://console.groq.com)
- Get free proxy credentials at [webshare.io](https://webshare.io) (needed to fetch transcripts from a cloud server)

### 5. Run the backend

```bash
uvicorn backend.main:app --reload --port 8000
```

- Web UI → [http://localhost:8000](http://localhost:8000)
- API docs → [http://localhost:8000/docs](http://localhost:8000/docs)

---

## Deployment (Railway)

1. Push this repo to GitHub
2. Create a new project on [Railway](https://railway.app) and connect your repo
3. Add these environment variables in Railway → Variables:
   - `GROQ_API_KEY`
   - `WEBSHARE_USERNAME`
   - `WEBSHARE_PASSWORD`
4. Railway will build using the `Dockerfile` and deploy automatically

---

## Chrome Extension

1. Open Chrome → `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `extension/` folder
4. The extension appears as a side panel when you click the icon

> If using the deployed version, update `BACKEND` in `extension/popup.js`:
> ```js
> const BACKEND = "https://your-app.railway.app";
> ```

---

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Check server status |
| POST | `/load` | Load a YouTube video by URL |
| POST | `/chat` | Ask a question about a loaded video |

### `/load`
```json
{ "url": "https://www.youtube.com/watch?v=VIDEO_ID" }
```

### `/chat`
```json
{ "video_id": "VIDEO_ID", "question": "What is this video about?" }
```

---

## Notes

- FAISS indexes are cached locally at `faiss_index/{video_id}/` — reloading the same video is instant
- Vector stores are held in memory — they reset on server restart
- HuggingFace embedding model (~90MB) is downloaded on first run

---

## Author

Built by **Akash** · [GitHub](https://github.com/AkashKumar2000) · [LinkedIn](https://www.linkedin.com/in/akash-bargoti/)
