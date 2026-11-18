from vector_store import index
from embedder import embed
from loader import questions,answers
import numpy as np

def retrieve(query : str, k : int = 3) -> list[str]:
    query_embedding = embed(query)
    query_embedding = np.array(
        [query_embedding]
        )
    distance, indices = index.search(
        query_embedding,
        k
    )
    
    threshold = 0.5
    result = []
    for dist,idx in zip(distance[0],indices[0]):
        if dist < threshold:
            result.append(
                {
                    "question" : questions[idx],
                    "answer" : answers[idx],
                    "distance" : float(dist)
                }
            )
    
    print(result)
    return result
    
