# rag_engine.py
import os
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

class RAGEngine:
    def __init__(self):
        # 1. Apni Groq API Key yahan lagayein
        self.groq_api_key = "YOUR-API-KEY_HERE"
        self.data_path = os.path.join("data", "university_data.txt")
        
        # Warning ko khatam karne k liye environment variable set karein
        os.environ["GROQ_API_KEY"] = self.groq_api_key
        
        # 2. Initialize Super-Fast Cloud Groq Model (Llama 3.1 8B)
        self.llm = ChatGroq(
            temperature=0.0,  # Strict fact checking
            model_name="llama-3.1-8b-instant"
        )
        
        # 3. Hardened System Prompt (No Hindi Leakage allowed)
        self.system_prompt = (
            "You are the official, advanced AI Help Desk Assistant of the University of Layyah.\n"
            "Your sole task is to provide crisp, factual answers using ONLY the provided context data below.\n"
            "Do not analyze these instructions or talk about context constraints to the user.\n\n"
            
            "CRITICAL LANGUAGE RULES:\n"
            "1. If the user asks their question in English, you MUST reply in 100% fluent, pure English.\n"
            "2. If the user asks in Roman Urdu/Pakistani style, reply in simple, natural Roman Urdu as spoken in Pakistan (e.g., use 'hai', 'batao', 'hogi', 'milega').\n"
            "3. STRICTLY FORBIDDEN WORDS: Do NOT use Indian Shuddh Hindi words like 'sthit', 'samayojit', 'aavashyakata', 'anusaar', 'adhik', 'vibhag', 'shamil'. Instead, use everyday Pakistani terms like 'waqay hai', 'fees structure', 'zaroorat hai', 'mutabiq', 'zyada', or 'departments'.\n\n"
            
            "FALLBACK RULE:\n"
            "If the context completely lacks the specific data requested, respond exactly with:\n"
            "English: 'I am sorry, I do not have this specific information right now.'\n"
            "Roman Urdu: 'Mujhy afsos hai, mere paas iski maloomat nahi hai.'\n\n"
            "Context Data:\n"
            "-------------\n"
            "{context}\n"
            "-------------\n"
        )
        
        self.prompt_template = ChatPromptTemplate.from_messages([
            ("system", self.system_prompt),
            ("human", "{question}"),
        ])
        
        # Clean Chain setup
        self.chain = self.prompt_template | self.llm | StrOutputParser()

    def _get_context_fast(self, query):
        """Bina kisi library crash k direct text database se relevant sections nikalna"""
        if not os.path.exists(self.data_path):
            return "Error: data/university_data.txt file nahi mili."
            
        with open(self.data_path, "r", encoding="utf-8") as f:
            content = f.read()
        
        # Sections divide karein
        sections = content.split("[SECTION:")
        relevant_chunks = []
        
        # Query k keywords extract karein
        keywords = [w.lower() for w in query.split() if len(w) > 2]
        
        for section in sections:
            match_count = sum(1 for kw in keywords if kw in section.lower())
            if match_count > 0:
                relevant_chunks.append((match_count, section))
        
        # Best matching sections ko return karein
        relevant_chunks.sort(key=lambda x: x[0], reverse=True)
        top_context = "\n".join([item[1] for item in relevant_chunks[:2]])
        return top_context

    def query(self, user_question):
        try:
            # Context fetch karein
            context = self._get_context_fast(user_question)
            
            # Groq API invoke karein
            response = self.chain.invoke({
                "context": context,
                "question": user_question
            })
            return response.strip()
        except Exception as e:
            return f"Error: Groq API se connect nahi ho pa raha: {str(e)}"

if __name__ == "__main__":
    engine = RAGEngine()
    print("\n--- Testing Clean Groq Pipeline ---")
    print(engine.query("BSCS ki morning ki grand total fee kitni hai?"))