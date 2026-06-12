import os
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

def run_ingestion():
    # Paths define karein
    DATA_PATH = os.path.join("data", "university_data.txt")
    DB_FAISS_PATH = "vector_db"

    print("[*] Ingestion process shuru ho raha hai...")

    # 1. Check karein k data file maujood hai ya nahi
    if not os.path.exists(DATA_PATH):
        print(f"[-] Error: {DATA_PATH} nahi mili! Pehle data folder aur file banayein.")
        return

    # 2. Raw Text Data Read karein
    with open(DATA_PATH, "r", encoding="utf-8") as f:
        raw_text = f.read()

    # 3. Text ko smart chunks mein split karein
    # Hackathon data k liye 500 chunk size aur 50 overlap perfect hai text context barqarar rakhne k liye
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=150)
    docs = text_splitter.create_documents([raw_text])
    print(f"[+] Data successfully split ho gaya {len(docs)} chunks mein.")

    # 4. Free Local Embeddings Initialize karein (CPU friendly & Fast)
    print("[*] Local Embedding Model load ho raha hai (sentence-transformers)...")
    embeddings = HuggingFaceEmbeddings(model_name="sentence-transformers/all-MiniLM-L6-v2")

    # 5. FAISS Vector Store banayein aur locally save karein
    print("[*] Embeddings generate ho rahi hain aur FAISS Vector DB ban raha hai...")
    db = FAISS.from_documents(docs, embeddings)
    db.save_local(DB_FAISS_PATH)
    
    print(f"[+] Mubarak ho! Vector Database successfully '{DB_FAISS_PATH}' folder mein save ho chuka hai.\n")

if __name__ == "__main__":
    run_ingestion()