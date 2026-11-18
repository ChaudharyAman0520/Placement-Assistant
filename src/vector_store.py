import os
import faiss
import pickle
import numpy as np
from loader import questions, answers
from embedder import model

if os.path.exists("faiss.index") and os.path.exists("data.pkl"):
    index = faiss.read_index("faiss.index")

    with open("data.pkl", "rb") as f:
        data = pickle.load(f)

    questions = data['questions']
    answers = data['answers']

else:
    embeddings = model.encode(
        questions
    )

    dimensions = embeddings.shape[1]
    index = faiss.IndexFlatL2(
        dimensions
    )

    index.add(
        np.array(
            embeddings
        )
    )

    faiss.write_index(
        index,
        "faiss.index"
    )

    with open("data.pkl", "wb") as f:
        pickle.dump(
            {
                "questions" : questions,
                "answers" : answers
            },
            f
        )