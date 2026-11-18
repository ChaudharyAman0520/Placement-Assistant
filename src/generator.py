import os
from groq import Groq
import ollama
from dotenv import load_dotenv

load_dotenv()

client = Groq(
    api_key = os.getenv("GROQ_API_KEY")
)

def generate(prompt: str) -> str:
    try:
        response = client.chat.completions.create(
            model="openai/gpt-oss-120b",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
        return response.choices[0].message.content

    except Exception as e:
            print(f"Groq failed: {e}")

    try:
        response = ollama.chat(
            model="llama3.2:3b",
            messages=[
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )
        return response["message"]["content"]
    
    except Exception as e:
        print(f"Ollama failed: {e}")
        return "Sorry, both the online and local AI models are currently unavailable."