import os
from huggingface_hub import login
login(os.getenv("HF_TOKEN"))

from sentence_transformers import SentenceTransformer
import numpy as np

model = SentenceTransformer("all-MiniLM-L6-v2")

def embed(text : str) -> np.ndarray:
    return model.encode(text)