from embedder import embed

embedding = embed("How to prepare for Amazon?")
print(type(embedding))
print(embedding.shape)