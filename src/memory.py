import json
import os
import uuid

FILE = "memory_store.json"


def load_memory():
    if not os.path.exists(FILE):
        return {}

    with open(FILE, "r") as f:
        return json.load(f)


def save_memory(data):
    with open(FILE, "w") as f:
        json.dump(data, f, indent=4)


def create_session():
    return str(uuid.uuid4())


def get_history(session_id):
    memory = load_memory()
    return memory.get(session_id, [])


def add_message(session_id, user, assistant):
    memory = load_memory()

    if session_id not in memory:
        memory[session_id] = []

    memory[session_id].append({
        "user": user,
        "assistant": assistant
    })

    memory[session_id] = memory[session_id][-3:]

    save_memory(memory)