import os
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv(dotenv_path=".env")

api_key = os.getenv("OPENAI_API_KEY")

if not api_key:
    raise ValueError("OPENAI_API_KEY not found. Check your .env file.")

client = OpenAI(api_key=api_key)

def ask_ai(question):
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": question}
        ]
    )
    return response.choices[0].message.content

if __name__ == "__main__":
    while True:
        user_input = input("Ask something (type 'exit' to quit): ")
        if user_input.lower() == "exit":
            break

        answer = ask_ai(user_input)
        print("\nAI:", answer, "\n")