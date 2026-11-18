import pandas as pd

df = pd.read_csv("../data/placement_qa.csv")
questions = df['question'].tolist()
answers = df['answer'].tolist()
