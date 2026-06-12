# app.py
from flask import Flask, render_template, request, jsonify
from rag_engine import RAGEngine
import os

app = Flask(__name__)

# Core AI Pipeline Engine instance initialize karein
# Yeh server start hote hi background mein models map kar dega
print("[*] University of Layyah AI Engine startup loading...")
ai_engine = RAGEngine()
print("[+] Server AI Core Engine Ready to handle web requests.")

@app.route("/")
def index():
    # Yeh check karega k templates folder mein index.html hai ya nahi
    return render_template("index.html")

@app.route("/chat", methods=["POST"])
def chat_endpoint():
    """
    Frontend se incoming AJAX JSON data handle karne ka scalable API endpoint.
    Expected Input Payload format: {"message": "User query text here"}
    """
    data = request.get_json()
    
    if not data or "message" not in data:
        return jsonify({"error": "Bad Request: 'message' key missing ho gyi payload se"}), 400
    
    user_message = data["message"].strip()
    
    if user_message == "":
        return jsonify({"response": "Aap ne khali message bheja hai. Please kuch poochiye!"})
    
    # RAG pipeline execute kar k response nikalyein
    bot_response = ai_engine.query(user_message)
    
    # Response return karein clean REST standard JSON format mein
    return jsonify({
        "status": "success",
        "response": bot_response
    })

if __name__ == "__main__":
    # Development phase mein port 5000 par run ho raha hai
    # Hackathon demo k waqt debug=False rakhna behtar hai performance stability k liye
    app.run(host="0.0.0.0", port=5000, debug=True)