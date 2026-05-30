import os
import uuid
import time
from fastapi.responses import StreamingResponse
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
from openai import OpenAI
from pypdf import PdfReader
from docx import Document

from langchain_text_splitters import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_chroma import Chroma


load_dotenv(dotenv_path=".env")

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class QuestionRequest(BaseModel):
    question: str
    selected_document: str = "all"
    chat_history: list = []
    
class DeleteDocumentRequest(BaseModel):
    filename: str

#vector_store = None
uploaded_documents = []
embeddings = OpenAIEmbeddings(
    api_key=os.getenv("OPENAI_API_KEY")
)

vector_store = Chroma(
    persist_directory="chroma_db",
    collection_name="documents",
    embedding_function=embeddings
)

class SearchRequest1(BaseModel):
    query: str
    selected_document: str = "all"

class SearchRequest(BaseModel):
    query: str
    selected_document: str = "all"
    chat_history: list = []

def create_vector_store(text, filename):
    splitter = CharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    chunks = splitter.split_text(text)

    metadatas = [
        {"filename": filename}
        for _ in chunks
    ]

    ids = [
        f"{filename}_{uuid.uuid4().hex}_{i}"
        for i in range(len(chunks))
    ]

    vector_store.add_texts(
        texts=chunks,
        metadatas=metadatas,
        ids=ids
    )

    return vector_store
@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    global vector_store

    text = ""

    if file.filename.endswith(".txt"):
        content = await file.read()
        text = content.decode("utf-8", errors="ignore")

    elif file.filename.endswith(".pdf"):
        temp_path = f"temp_{file.filename}"

        with open(temp_path, "wb") as f:
            f.write(await file.read())

        reader = PdfReader(temp_path)

        for page in reader.pages:
            extracted = page.extract_text()
            if extracted:
                text += extracted + "\n"

    elif file.filename.endswith(".docx"):
        temp_path = f"temp_{file.filename}"

        with open(temp_path, "wb") as f:
            f.write(await file.read())

        doc = Document(temp_path)
       
        for para in doc.paragraphs:
            text += para.text + "\n"

    else:
        return {"error": "Only .txt, .pdf, and .docx supported"}

    vector_store = create_vector_store(
        text,
        file.filename
    )
    if file.filename not in uploaded_documents:
        uploaded_documents.append(file.filename)
    return {
        "message": f"{file.filename} uploaded successfully"
    }


@app.post("/ask")
async def ask_question(request: QuestionRequest):
    if vector_store is None:
        return {
            "answer": "Please upload a document first.",
            "sources": []
        }

    
    if request.selected_document == "all":
        docs = vector_store.similarity_search(
            request.question,
            k=8
    )
    else:
        docs = vector_store.similarity_search(
            request.question,
            k=8,
            filter={
                "filename": request.selected_document
        }
    )
    context = "\n\n".join(
        [doc.page_content for doc in docs]
    )

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "Answer only from the provided document context."
            },
            {
                "role": "user",
                "content": f"Context:\n{context}\n\nQuestion:\n{request.question}"
            }
        ]
    )

    answer = response.choices[0].message.content

    
    
    unique_sources = {}

    for doc in docs:
        filename = doc.metadata.get("filename", "Unknown")

        if filename not in unique_sources:
            unique_sources[filename] = {
                "filename": filename,
                "snippet": doc.page_content[:300]
            }

    sources = list(unique_sources.values())
    return {
        "answer": answer,
        "sources": sources
    }
@app.post("/ask-stream")
async def ask_question_stream(request: QuestionRequest):
    if vector_store is None:
        return StreamingResponse(
            iter(["Please upload a document first."]),
            media_type="text/plain"
        )

    if request.selected_document == "all":
        docs = vector_store.similarity_search(
            request.question,
            k=8
        )
    else:
        docs = vector_store.similarity_search(
            request.question,
            k=8,
            filter={
                "filename": request.selected_document
            }
        )

    context = "\n\n".join(
        [doc.page_content for doc in docs]
    )

    chat_history = "\n".join(
        [
            f"{msg['role']}: {msg['content']}"
            for msg in request.chat_history
        ]
    )
    def generate():
        stream = client.chat.completions.create(
            model="gpt-4o-mini",
            stream=True,
            messages=[
                {
                    "role": "system",
                    "content": "Answer only from the provided document context."
                },
                {
                    "role": "user",
                    "content": f"""
                    Conversation history:
                    {chat_history}

                    Document context:
                    {context}

                    Current question:
                    {request.question}
                    """
                }
            ]
        )

        for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content

    return StreamingResponse(
        generate(),
        media_type="text/plain"
    ) 

def get_document_names_from_chroma():
    data = vector_store.get()

    filenames = set()

    for metadata in data["metadatas"]:
        if metadata and "filename" in metadata:
            filenames.add(metadata["filename"])

    return sorted(list(filenames))
    
#@app.get("/documents")
async def get_documents_old():
    return {
        "documents": uploaded_documents
    }

@app.get("/documents")
async def get_documents():
    documents = get_document_names_from_chroma()

    return {
        "documents": documents
    } 

#@app.delete("/documents")
async def delete_document_Old(request: DeleteDocumentRequest):
    global vector_store

    if vector_store is not None:
        vector_store.delete(
            where={"filename": request.filename}
        )

    if request.filename in uploaded_documents:
        uploaded_documents.remove(request.filename)

    return {
        "message": f"{request.filename} deleted successfully",
        "documents": uploaded_documents
    }
    
@app.delete("/documents")
async def delete_document(request: DeleteDocumentRequest):
    vector_store.delete(
        where={"filename": request.filename}
    )

    documents = get_document_names_from_chroma()

    return {
        "message": f"{request.filename} deleted successfully",
        "documents": documents
    }
@app.post("/search")
async def search_documents(request: SearchRequest):

    if request.selected_document == "all":
        docs = vector_store.similarity_search(
            request.query,
            k=10
        )
    else:
        docs = vector_store.similarity_search(
            request.query,
            k=10,
            filter={
                "filename": request.selected_document
            }
        )

   
    unique_results = {}

    for doc in docs:
        filename = doc.metadata.get(
            "filename",
            "Unknown"
        )

        if filename not in unique_results:
            unique_results[filename] = {
                "filename": filename,
                "snippet": doc.page_content[:300]
        }

    results = list(unique_results.values())

    return {
        "results": results
    }