import os
import pickle
import faiss
import numpy as np

from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher
from dotenv import load_dotenv
load_dotenv()

from openai import OpenAI

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STORE_DIR = os.path.join(BASE_DIR, "..", "rag_store")

FAISS_PATH = os.path.join(STORE_DIR, "index.faiss")
META_PATH  = os.path.join(STORE_DIR, "meta.pkl")

print("OPENAI_API_KEY:", "SET" if os.environ.get("OPENAI_API_KEY") else "MISSING")
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

print("Loading FAISS index...")
index = faiss.read_index(FAISS_PATH)

print("Loading meta.pkl...")
with open(META_PATH, "rb") as f:
    meta = pickle.load(f)

print(f"Loaded {len(meta)} chunks.")


# ========= embedding  =========
def embed_query(text: str) -> np.ndarray:
    resp = client.embeddings.create(
        model="text-embedding-3-small",  
        input=text
    )
    vec = np.array([resp.data[0].embedding], dtype="float32")
    faiss.normalize_L2(vec)  
    return vec


# ========= RAG Action =========
class ActionKpuRagAnswer(Action):

    def name(self) -> Text:
        return "action_kpu_rag"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        query = tracker.latest_message.get("text", "").strip()

        if not query:
            dispatcher.utter_message(text="Please type your question.")
            return []

        # ---- embedding query ----
        q_vec = embed_query(query)

        # ---- FAISS search ----
        top_k = 5
        distances, indices = index.search(q_vec, top_k)

        contexts = []
        sources = []

        for idx in indices[0]:
            if idx == -1:
                continue

            item = meta[idx]

            text = item.get("text", "")
            url = item.get("url", "")

            contexts.append(text[:2000]) 
            if url:
                sources.append(url)

        context_text = "\n\n---\n\n".join(contexts)[:8000]

  
        prompt = f"""
You are a helpful assistant for Kwantlen Polytechnic University (KPU).

Answer ONLY using the context below.
If the answer is not found in the context, say you don't know and suggest checking the official KPU website.

Question:
{query}

Context:
{context_text}
"""

        response = client.chat.completions.create(
            model="gpt-4.1-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2,
        )

        answer = response.choices[0].message.content.strip()

        unique_sources = []
        for s in sources:
            if s not in unique_sources:
                unique_sources.append(s)

        if unique_sources:
            answer += "\n\nSources:\n" + "\n".join(unique_sources[:5])

        dispatcher.utter_message(text=answer)
        return []