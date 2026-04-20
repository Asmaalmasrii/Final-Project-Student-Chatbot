import os
import pickle
import re
from typing import Any, Text, Dict, List
from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
STORE_DIR = os.path.join(BASE_DIR, "..", "rag_store")
META_PATH  = os.path.join(STORE_DIR, "meta.pkl")

print("Loading meta.pkl locally...")
with open(META_PATH, "rb") as f:
    meta = pickle.load(f)

print(f"Loaded {len(meta)} chunks for local text retrieval.")

def local_keyword_search(query: str, meta_list: list, top_k=2):
    """
    Performs a localized keyword match over the PKL metadata without relying 
    on OpenAI Embeddings or FAISS indexing structures.
    """
    words = set(re.findall(r'\w+', query.lower()))
    if not words: return []
    
    scored = []
    # Drop overly common grammar words to slightly improve primitive search
    stop_words = {"what", "is", "the", "a", "an", "how", "do", "i", "can", "you", "tell", "me", "about", "for", "of", "to", "in", "and"}
    meaningful_words = words - stop_words
    
    # If filter removed everything (e.g. "what is it"), fallback to full query
    search_words = meaningful_words if meaningful_words else words

    for item in meta_list:
        text = str(item.get("text", "")).lower()
        score = sum(1 for w in search_words if w in text)
        if score > 0:
            # Boost score slightly if exact phrase is found
            if query.lower() in text:
                score += 5
            scored.append((score, item))
            
    scored.sort(key=lambda x: x[0], reverse=True)
    return [item for score, item in scored[:top_k]]

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

        # ---- Local text search bypassing API ---- 
        best_items = local_keyword_search(query, meta, top_k=2)

        if not best_items:
             dispatcher.utter_message(text="I couldn't find a matching answer in my local database. I'm currently running fully offline without external API access. Please check the official KPU website!")
             return []

        answer = "Here is the most relevant information I found locally:\n\n"
        sources = []
        
        for item in best_items:
            text = str(item.get("text", ""))[:800] # Clamp context length
            answer += f"• {text}...\n\n"
            url = item.get("url", "")
            if url and url not in sources:
                sources.append(url)
                
        if sources:
            answer += "Sources:\n" + "\n".join(sources)

        dispatcher.utter_message(text=answer.strip())
        return []