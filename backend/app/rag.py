import os
from dotenv import load_dotenv
from openai import OpenAI

from langchain_text_splitters import CharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS


load_dotenv(dotenv_path="../../.env")
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def load_document(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()

def create_vector_store(text):
    splitter = CharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_text(text)

    embeddings = OpenAIEmbeddings()
    vector_store = FAISS.from_texts(chunks, embeddings)

    return vector_store

def ask_document(question, vector_store):
    docs = vector_store.similarity_search(question, k=3)

    context = "\n\n".join([doc.page_content for doc in docs])

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "Answer based only on the provided context."},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion:\n{question}"}
        ]
    )

    return response.choices[0].message.content

if __name__ == "__main__":
    
    file_path = "sample.txt"
    text = load_document(file_path)
    vector_store = create_vector_store(text)

    while True:
        question = input("Ask about document (type 'exit'): ")
        if question.lower() == "exit":
            break

        answer = ask_document(question, vector_store)
        print("\nAI:", answer, "\n")