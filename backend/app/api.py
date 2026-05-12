import uuid
from fastapi import FastAPI
from fastapi import UploadFile, File
from pypdf import PdfReader
from docx import Document
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
from dotenv import load_dotenv

from pydantic import BaseModel
from openai import OpenAI

from langchain_text_splitters import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
# from langchain_community.vectorstores import FAISS
from langchain_chroma import Chroma
import time

# Load .env
load_dotenv(dotenv_path=".env")

# OpenAI client
client = OpenAI(
    api_key=os.getenv("OPENAI_API_KEY")
)

# Create FastAPI app
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
# Request model
class QuestionRequest(BaseModel):
    question: str

# Load document
def load_document(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()

# Create vector DB
def create_vector_store(text):
    splitter = CharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    chunks = splitter.split_text(text)

    embeddings = OpenAIEmbeddings(
        api_key=os.getenv("OPENAI_API_KEY")
    )

    vector_store = Chroma.from_texts(
        texts=chunks,
        embedding=embeddings,
        persist_directory="chroma_db",
        collection_name=f"doc_{uuid.uuid4().hex}"
    )

    return vector_store
def create_vector_store_faiss(text):
    splitter = CharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    chunks = splitter.split_text(text)

    embeddings = OpenAIEmbeddings(
        api_key=os.getenv("OPENAI_API_KEY")
    )

    vector_store = FAISS.from_texts(
        chunks,
        embeddings
    )

    return vector_store

# Load document once
text = load_document(
    "backend/app/sample.txt"
)

vector_store = create_vector_store(text)

# AI logic
def ask_document(question, vector_store):
    docs = vector_store.similarity_search(
        question,
        k=3
    )

    context = "\n\n".join(
        [doc.page_content for doc in docs]
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "Answer only from the provided context."
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion:\n{question}"
            }
        ]
    )

    return response.choices[0].message.content

# API endpoint
@app.post("/ask")
def ask(request: QuestionRequest):

    answer = ask_document(
        request.question,
        vector_store
    )

    return {
        "question": request.question,
        "answer": answer
    }

@app.post("/upload")

async def upload_file(file: UploadFile = File(...)):

    global vector_store

    text = ""

    # TXT
    if file.filename.endswith(".txt"):

        content = await file.read()

        text = content.decode(
            "utf-8",
            errors="ignore"
        )

    # PDF
    elif file.filename.endswith(".pdf"):

        temp_path = f"temp_{file.filename}"

        with open(temp_path, "wb") as f:
            f.write(await file.read())

        reader = PdfReader(temp_path)

        for page in reader.pages:

            extracted = page.extract_text()

            if extracted:
                text += extracted + "\n"

    # DOCX
    elif file.filename.endswith(".docx"):

        temp_path = f"temp_{file.filename}"

        with open(temp_path, "wb") as f:
            f.write(await file.read())

        doc = Document(temp_path)

        for para in doc.paragraphs:
            text += para.text + "\n"

    # Unsupported
    else:

        return {
            "error": "Only .txt, .pdf, and .docx supported"
        }

    # Create vector DB
    vector_store = None
    folder_name = f"chroma_db_{int(time.time())}"

    vector_store = Chroma.from_texts(
        texts=CharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        ).split_text(text),
        embedding=OpenAIEmbeddings(
            api_key=os.getenv("OPENAI_API_KEY")
        ),
    persist_directory=folder_name
    )
   
    vector_store = create_vector_store(text)
    

    return {
        "message": f"{file.filename} uploaded successfully"
    }