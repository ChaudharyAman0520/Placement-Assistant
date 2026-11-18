from flask import Flask, request, jsonify
from memory import add_message, get_history, create_session
from retriever import retrieve
from prompt_builder import build_prompt
from generator import generate
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/")
def home():
    return {
        "message" : "Placement Assistance API Running"
    }

@app.route("/chat", methods=["POST"])
def chat():
    data = request.get_json()
    session_id = data.get("session_id")
    query = data['query']
    
    if session_id is None:
        session_id = create_session()

    history = get_history(session_id=session_id)

    results = retrieve(query=query)
    context = []

    for result in results:
        context.append(
            f"Question: {result['question']}\n"
            f"Answer: {result['answer']}"
        )
    
    prompt = build_prompt(
        query=query,
        context=context,
        history=history
    )

    answer = generate(prompt=prompt)

    add_message(
    session_id=session_id,
    user=query,
    assistant=answer
    )

    return jsonify({
        "session_id" : session_id,
        "answer" : answer,
        "sources" : results
    })

if __name__ == "__main__":
    app.run(debug=True)