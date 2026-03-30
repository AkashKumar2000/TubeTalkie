from langchain_community.document_loaders import TextLoader
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
import os


def embed_transcript(file_path):

    loader= TextLoader(file_path , encoding="utf-8")
    docs= loader.load()


    text_splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks= text_splitter.split_documents(docs)

    embed_llm = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")

    video_id = os.path.splitext(os.path.basename(file_path))[0] # Extractine the video base name
    index_path= os.path.join("faiss_index", video_id)  # joining the faiss_index with video_id name to fetch the embedding in future

    if os.path.exists(index_path):
        print("Loading existing vector store...")
        vector_store = FAISS.load_local(
        index_path,
        embed_llm,
        allow_dangerous_deserialization=True
        )
    else:
        print("Creating new vector store...")
        vector_store = FAISS.from_documents(chunks, embed_llm)
        vector_store.save_local(index_path)

    return vector_store
