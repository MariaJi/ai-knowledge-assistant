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


from .prompts.summary_prompts import get_summary_prompt
from .prompts.metadata_prompts import METADATA_PROMPT
from .prompts.insights_prompts import get_document_insights_prompt

import json
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
    selected_documents: list[str] = []
    chat_history: list = []
    
class SuggestedQuestionsRequest(BaseModel):
    answer: str
    question: str = ""
    

class DeleteDocumentRequest(BaseModel):
    filename: str

class MultiSummaryRequest(BaseModel):
    selected_documents: list[str] = []

class ResumeMatchRequest(BaseModel):
    resume_document: str
    job_description_document: str

class TagSuggestionRequest(BaseModel):
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
    
class SummaryRequest(BaseModel):
    selected_document: str

class CompareRequest(BaseModel):
    document_a: str
    document_b: str

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
    keyword_prompt = f"""
        Extract 5 to 8 short keywords from this document.
        Return only a comma-separated list. No explanation.

        Document:
        {text[:3000]}
    """

    keyword_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": keyword_prompt}
        ]
    )

    keywords = keyword_response.choices[0].message.content
    
    summary_prompt = f"""
    Summarize this document in 2 to 3 concise sentences.
    Use only the document text.

    Document:
    {text[:3000]}
    """

    summary_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": summary_prompt}
        ]
    )

    summary = summary_response.choices[0].message.content
    
    topic_prompt = f"""
    Identify the main topic of this document.
    Return only a short topic label, 2 to 5 words.
    No explanation.

    Document:
    {text[:3000]}
    """

    topic_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": topic_prompt}
        ]
    )

    topic = topic_response.choices[0].message.content
    
    
    questions_prompt = f"""
            Generate 3 useful questions a user might ask about this document.
            Return only the questions, one per line.
            No numbering. No explanation.

            Document:
            {text[:3000]}
    """

    questions_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "user", "content": questions_prompt}
        ]
    )

    suggested_questions = questions_response.choices[0].message.content
    
    if file.filename not in uploaded_documents:
        uploaded_documents.append(file.filename)
    word_count = len(text.split())
    character_count = len(text)
    reading_time_minutes = max(1, round(word_count / 200))
    preview = text[:500]
    return {
        "message": f"{file.filename} uploaded successfully",
        "keywords": keywords,
        "summary": summary,
        "topic" : topic,
        "word_count": word_count,
        "character_count": character_count,
        "reading_time_minutes": reading_time_minutes,
        "preview": preview,
        "suggested_questions": suggested_questions,
    }

def rewrite_question_with_history(question, chat_history):
    if not chat_history:
        return question

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Rewrite the user's latest question into a standalone search query. "
                        "Use the chat history only to resolve references like 'it', 'that', "
                        "'the second one', or 'this document'. "
                        "Do not answer the question. "
                        "Return only the rewritten query."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Chat history:\n{chat_history}\n\nLatest question:\n{question}",
                },
            ],
            temperature=0,
        )

        rewritten = response.choices[0].message.content.strip()
        return rewritten or question

    except Exception:
        return question

@app.post("/ask")
async def ask_question(request: QuestionRequest):
    if vector_store is None:
        return {
            "answer": "Please upload a document first.",
            "sources": []
        }
    #rewritten_question = request.question
    rewritten_question = rewrite_question_with_history(
    request.question,
    request.chat_history
    )
    
    print("Original question:", request.question)
    print("Rewritten question:", rewritten_question)
    #print("Chat history:", request.chat_history)
    print(f"Chat history messages: {len(request.chat_history)}")
    if not request.selected_documents:
    #if len(request.selected_documents) == 0:
        docs = vector_store.similarity_search(
           
            rewritten_question,
            k=4
        )
    else:
        docs = vector_store.similarity_search(
            
            rewritten_question,
            k=4,
            filter={
                "filename": {
                "$in": request.selected_documents
                }
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
                "snippet": doc.page_content[:300],
                "chunk_count": 1
            }
        else:
            unique_sources[filename]["chunk_count"] += 1
        
    sources = list(unique_sources.values())
    return {
        "answer": answer,
        "sources": sources,
        "rewritten_question": rewritten_question
    }


@app.post("/suggest-questions")
def suggest_questions(request: SuggestedQuestionsRequest):
    prompt = f"""
You are generating follow-up questions for an AI Knowledge Assistant.

The assistant answer was created from uploaded documents.

User question:
{request.question}

Assistant answer:
{request.answer}

Generate 4 short follow-up questions that help the user explore the uploaded documents further.

Rules:
- Return only a JSON array of strings.
- No markdown.
- No explanations.
- Each question should be under 15 words.
- Questions should be specific and useful.
"""

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "You generate concise, document-focused follow-up questions."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.4,
        )

        text = response.choices[0].message.content.strip()
        questions = json.loads(text)

        return {"questions": questions}

    except Exception as e:
        print("Suggest questions error:", e)
        return {"questions": []}


@app.post("/ask-stream")
async def ask_question_stream(request: QuestionRequest):
    if vector_store is None:
        return StreamingResponse(
            iter(["Please upload a document first."]),
            media_type="text/plain"
        )

    
    if len(request.selected_documents) == 0:
        docs = vector_store.similarity_search(
            request.question,
            k=8
        )
    else:
        docs = vector_store.similarity_search(
            request.question,
            k=8,
                filter={
                "filename": {
                "$in": request.selected_documents
                }
            }
        )
    
    context = "\n\n".join(
        [doc.page_content for doc in docs]
    )
    print("========== ASK STREAM CONTEXT ==========")
    print(context[:3000])
    print("========================================")
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




def detect_document_type(filename: str, content: str) -> str:
    classification_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """
You classify documents into exactly one of these types:

resume
job_description
requirements
technical
travel
general

Rules:
- Use resume for personal career documents describing a person's experience, skills, education, and projects.
- Use job_description for hiring posts, job openings, role descriptions, responsibilities, qualifications, and required skills.
- Use requirements for business requirements, functional requirements, user workflows, product specs, or report requirements.
- Use technical for technical explanations, architecture notes, AI/ML concepts, software design, or engineering articles.
- Use travel for hiking guides, travel plans, destination notes, road conditions, or trip planning.
- Use general if none of the above fit.

Return only the type name. Do not explain.
"""
            },
            {
                "role": "user",
                "content": f"""
Filename: {filename}

Document content:
{content[:4000]}
"""
            }
        ],
        temperature=0
    )

    document_type = classification_response.choices[0].message.content.strip().lower()

    allowed_types = {
        "resume",
        "job_description",
        "requirements",
        "technical",
        "travel",
        "general"
    }

    if document_type not in allowed_types:
        return "general"

    return document_type

def extract_document_metadata(filename: str, content: str) -> dict:
    metadata_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": METADATA_PROMPT
            },
            {
                "role": "user",
                "content": f"""
Filename: {filename}

Document content:
{content[:4000]}
"""
            }
        ],
        temperature=0
    )

    metadata_text = metadata_response.choices[0].message.content.strip()

    try:
        return json.loads(metadata_text)
    except json.JSONDecodeError:
        return {
            "document_type": "general"
        }

def extract_document_insights(filename: str, content: str, metadata: dict) -> str:
    insights_prompt = get_document_insights_prompt(
        content[:4000],
        metadata
    )

    insights_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": insights_prompt
            },
            {
                "role": "user",
                "content": f"""
Filename: {filename}

Generate insights for this document.
"""
            }
        ],
        temperature=0
    )

    return insights_response.choices[0].message.content.strip()



@app.post("/summarize")
async def summarize_document(request: SummaryRequest):

    docs = vector_store.similarity_search(
        request.selected_document,
        k=20,
        filter={
            "filename": request.selected_document
        }
    )

    context = "\n\n".join(
        [doc.page_content for doc in docs]
    )
    
    document_type = detect_document_type(
        request.selected_document,
        context
    )
    
    print(f"Detected document type: {document_type}")
    
    metadata = extract_document_metadata(
        request.selected_document,
        context
    )

    print(f"Extracted metadata: {metadata}")
    
    insights = extract_document_insights(
        request.selected_document,
        context,
        metadata
    )

    print(f"Extracted insights: {insights}")
    summary_prompt = get_summary_prompt(document_type)

    
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": summary_prompt
            },
            {
                "role": "user",
                "content": context
            }
        ]
    )

    return {
    "summary": response.choices[0].message.content,
    "metadata": metadata,
    "insights": insights
    }
    


@app.post("/resume-match")
async def resume_match(request: ResumeMatchRequest):
    if vector_store is None:
        return {
            "answer": "Please upload documents first.",
            "sources": []
        }

    resume_docs = vector_store.similarity_search(
        "professional experience skills projects education",
        k=8,
        filter={
            "filename": request.resume_document
        }
    )

    job_docs = vector_store.similarity_search(
        "job requirements responsibilities required skills qualifications",
        k=8,
        filter={
            "filename": request.job_description_document
        }
    )

    resume_context = "\n\n".join(
        [doc.page_content for doc in resume_docs]
    )

    job_context = "\n\n".join(
        [doc.page_content for doc in job_docs]
    )
    prompt = f"""
You are an experienced Senior AI Engineering hiring manager.

Evaluate how well the candidate's resume matches the job description using only the provided resume context and job description context.

Important evaluation rules:
- Base the analysis only on evidence found in the resume context.
- Evaluate only the resume evidence. Never state that the candidate lacks an ability. Instead, explain that the resume does not explicitly demonstrate or emphasize that ability.
- Do not assume the candidate lacks a skill simply because the resume uses different terminology.
- Consider closely related experience, transferable experience, and project evidence.
- If a job description lists multiple alternative technologies (for example, "LangChain or similar frameworks" or "ChromaDB, Pinecone, Weaviate, or FAISS"), do not treat every unmentioned technology as a missing skill when the resume demonstrates equivalent or comparable experience with one or more of the listed alternatives.
- If a skill is demonstrated indirectly or without enough detail, place it under "Skills to Highlight More."
- Only place a skill under "Missing Skills" when it is important to the role and there is no reasonable supporting evidence anywhere in the resume.
- Describe unsupported skills as "not demonstrated in the resume" rather than claiming the candidate does not possess them.
- Avoid repeating the same item in multiple sections.
- Keep the analysis professional, specific, and useful.


Resume Context:
{resume_context}

Job Description Context:
{job_context}

Return a professional job-fit report in this exact format:

## Match Score
Give a score from 0 to 100 and briefly explain the score based on resume evidence. Distinguish between an actual qualification gap and a skill that is simply not emphasized clearly in the resume.

## Overall Assessment
Provide a concise assessment of the candidate's overall fit for the role.

## Key Strengths
List the strongest direct matches between the resume and job description.

## Skills to Highlight More
List relevant skills or experience that appear in the resume but should be described more clearly, explicitly, or with stronger evidence.

## Missing Skills
List only important skills required by the job that are genuinely not demonstrated anywhere in the resume.
If there are no clear missing skills, say:
"No significant missing skills were identified from the provided resume."

## Resume Improvements
Suggest specific, truthful resume improvements for this job.
Do not invent experience, technologies, achievements, or metrics that are not supported by the resume.

## Interview Questions
Create 5 likely interview questions based on the job description and the candidate's demonstrated background.
"""
  
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "Only use the provided resume and job description context."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    answer = response.choices[0].message.content

    return {
        "answer": answer,
        "sources": [
            {
                "filename": request.resume_document,
                    "snippet": resume_context[:300]
            },
            {
                "filename": request.job_description_document,
                "snippet": job_context[:300]
            }
        ]
    }
    
    
    

@app.post("/compare")
async def compare_documents(request: CompareRequest):
    docs_a = vector_store.similarity_search(
        request.document_a,
        k=20,
        filter={
            "filename": request.document_a
        }
    )

    docs_b = vector_store.similarity_search(
        request.document_b,
        k=20,
        filter={
            "filename": request.document_b
        }
    )
    context_a = "\n\n".join(
        [doc.page_content for doc in docs_a]
    )

    context_b = "\n\n".join(
        [doc.page_content for doc in docs_b]
    )
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": """
Compare the two documents and return:

# Executive Summary

# Similarities

# Differences

# Important Changes

# Recommendations

Only use information from the provided documents.
"""
            },
            {
                "role": "user",
                "content": f"""
Document A:
{context_a}

Document B:
{context_b}
"""
            }
        ]
    )
    return {
        "comparison": response.choices[0].message.content
    }
    
@app.post("/summarize-multiple")
async def summarize_multiple_documents(request: MultiSummaryRequest):
    if vector_store is None:
        raise HTTPException(status_code=400, detail="No documents uploaded yet.")

    if len(request.selected_documents) == 0:
        docs = vector_store.similarity_search(
            "Summarize the main topics, key points, and important details.",
            k=20
        )
    else:
        docs = vector_store.similarity_search(
            "Summarize the main topics, key points, and important details.",
            k=20,
            filter={
                "filename": {
                    "$in": request.selected_documents
                }
            }
        )

    if not docs:
        return {
            "summary": "No document content found for the selected documents.",
            "sources": []
        }

    context = "\n\n".join([doc.page_content for doc in docs])

    selected_text = (
        "all uploaded documents"
        if len(request.selected_documents) == 0
        else ", ".join(request.selected_documents)
    )

    prompt = f"""
You are summarizing multiple documents.

Documents selected:
{selected_text}

Use only the provided document context.

Please provide:

1. Executive Summary
2. Key Topics
3. Important Details
4. Common Themes Across Documents
5. Differences Between Documents
6. Recommended Next Steps or Takeaways

Document context:
{context}
"""

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": "You are a helpful AI assistant."
            },
            {
                "role": "user",
                "content": prompt
            }
        ]
    )

    sources = list(
        {
            doc.metadata.get("filename", "Unknown")
            for doc in docs
        }
    )

    return {
        "summary": response.choices[0].message.content,
        "sources": sources
    }
    
@app.post("/suggest-tags")
async def suggest_tags(request: TagSuggestionRequest):

    docs = vector_store.similarity_search(
        request.filename,
        k=10,
        filter={
            "filename": request.filename
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
                "content": "You suggest short useful document tags."
            },
            {
                "role": "user",
                "content": f"""
Suggest 3 to 5 short tags for this document.

Rules:
- Return only comma-separated tags.
- No explanation.
- Use short tags like AI, Resume, Job Description, React, FastAPI, RAG, Career.

Document:
{context}
"""
            }
        ]
    )

    tag_text = response.choices[0].message.content

    tags = [
        tag.strip()
        for tag in tag_text.split(",")
        if tag.strip()
    ]

    return {
        "filename": request.filename,
        "tags": tags
    }
    