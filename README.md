# 🤖 Placement Assistant

An AI-powered Retrieval-Augmented Generation (RAG) assistant designed to help students prepare for technical and placement interviews. It features semantic search over a curated technical Q&A dataset with an LLM generation pipeline (Groq with local Ollama fallback), conversation memory, and a modern responsive chat UI.

---

## 🌟 Key Features

- **Semantic Q&A Retrieval:** Uses `sentence-transformers` (`all-MiniLM-L6-v2`) and a `FAISS` vector index to retrieve the most relevant placement and technical concepts.
- **RAG Pipeline:** Combines retrieved domain knowledge, previous conversation history, and an LLM generator (`openai/gpt-oss-120b` via Groq) with an offline local fallback (`llama3.2:3b` via Ollama).
- **Placement-Focused Guardrails:** Trained to handle DSA, CS fundamentals (OS, DBMS, CN, System Design), interview preparation, resume advice, and HR questions while declining unrelated queries.
- **Session Memory:** Retains multi-turn conversation context to resolve follow-up questions and pronouns naturally.
- **Modern Responsive UI:** Features markdown rendering, code block formatting, interactive starter prompts, typing indicators, and expandable source citations.

---

## 📁 Project Structure

```text
Placement-Assistant/
├── data/
│   └── placement_qa.csv        # Placement Q&A knowledge dataset
├── frontend/
│   ├── index.html              # Modern chat user interface
│   ├── script.js               # Chat logic, session management & markdown rendering
│   └── styles.css              # Responsive UI styles with typography & dark code blocks
├── src/
│   ├── app.py                  # Flask REST API server (/ and /chat)
│   ├── embedder.py             # SentenceTransformer embedding loader
│   ├── generator.py            # LLM generator (Groq API + Ollama fallback)
│   ├── loader.py               # CSV dataset loader
│   ├── memory.py               # Multi-turn session memory manager
│   ├── prompt_builder.py       # Strict placement-focused prompt builder
│   ├── retriever.py            # FAISS similarity search & threshold filter
│   └── vector_store.py         # FAISS vector index builder & pickle cache
├── .env.example                # Template for environment variables
├── .gitignore                  # Git ignore rules for virtualenvs & secrets
├── pyproject.toml              # Project dependencies & configuration
└── uv.lock                     # Dependency lockfile
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.11+ (or 3.13)
- (Optional) [Ollama](https://ollama.com/) with `llama3.2:3b` for offline fallback

### 2. Setup Virtual Environment & Install Dependencies
```bash
# Clone the repository
git clone <your-repo-url>
cd Placement-Assistant

# Create and activate virtual environment
python -m venv .venv

# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r src/requirements.txt
# OR if using uv:
uv sync
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your keys:
```bash
cp .env.example .env
```
Add your Groq API key:
```env
GROQ_API_KEY=your_groq_api_key_here
HF_TOKEN=your_huggingface_token_here
```

### 4. Running the Application

#### Start the Backend API
```powershell
cd src
python app.py
```
The API will run at `http://127.0.0.1:5000`.

#### Start the Frontend UI
In a separate terminal:
```powershell
cd frontend
python -m http.server 8000
```
Open [http://localhost:8000](http://localhost:8000) in your browser.

---

## 🧪 API Endpoints

- `GET /` — Health check endpoint.
- `POST /chat` — Send a query:
  ```json
  {
    "query": "What is Big O notation?",
    "session_id": "optional-uuid"
  }
  ```
  Response:
  ```json
  {
    "session_id": "...",
    "answer": "...",
    "sources": [...]
  }
  ```

---

## 📄 License
MIT License. Free for educational and personal use.
