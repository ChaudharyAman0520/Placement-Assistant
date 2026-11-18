from retriever import retrieve
from prompt_builder import build_prompt
from generator import generate

def main():
    query = input("Question : ")
    context =  retrieve(query)
    prompt = build_prompt(
        query = query,
        context = context
    )

    answer = generate(prompt=prompt)
    print("\nAnswer:")
    print(answer)

if __name__ == "__main__":
    main()
