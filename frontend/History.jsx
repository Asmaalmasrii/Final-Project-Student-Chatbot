import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000";

export default function History() {
  const [items, setItems] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get(`${API_BASE}/history`, { withCredentials: true });
        setItems(res.data || []);
      } catch (e) {
        setErr(e?.response?.data?.error || "Failed to load history");
      }
    })();
  }, []);

  // Common styling tokens
  const containerStyle = { maxWidth: 1000, margin: "0 auto", padding: "40px 15px" };
  const titleStyle = { color: "#800022", fontSize: "2.2rem", fontWeight: "700", margin: 0, marginBottom: "25px" };
  const cardStyle = {
    backgroundColor: "#371C23",
    color: "#F4EDE2",
    borderRadius: "15px",
    padding: "30px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
    marginBottom: "30px"
  };

  return (
    <div style={containerStyle}>
      <h3 style={titleStyle}>Previous Messages</h3>

      {err && (
        <div style={{ backgroundColor: "#371C23", color: "#F4EDE2", padding: "15px 20px", borderRadius: "10px", marginBottom: "20px", borderLeft: "5px solid #f87171", fontWeight: "500" }}>
          {err}
        </div>
      )}

      <div style={cardStyle}>
        {items.length === 0 ? (
          <div style={{ color: "rgba(244,237,226,0.6)", fontStyle: "italic", textAlign: "center", padding: "20px 0" }}>
            No messages yet. Start a conversation in the Chat tab!
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {items.map((m) => {
              const isUser = m.sender === "user";
              return (
                <div 
                  key={m.id} 
                  style={{ 
                    backgroundColor: isUser ? "#F4EDE2" : "rgba(244,237,226, 0.08)", 
                    color: isUser ? "#371C23" : "#F4EDE2",
                    padding: "20px", 
                    border: isUser ? "none" : "1px solid rgba(244,237,226, 0.1)", 
                    borderRadius: "12px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: isUser ? "flex-end" : "flex-start",
                    alignSelf: isUser ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                    minWidth: "40%"
                  }}
                >
                  <div style={{ 
                    fontSize: "0.80rem", 
                    textTransform: "uppercase", 
                    letterSpacing: "0.5px", 
                    marginBottom: "8px", 
                    opacity: isUser ? 0.7 : 0.6,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px"
                  }}>
                    <span style={{ 
                      backgroundColor: isUser ? "#371C23" : "#800022", 
                      padding: "3px 8px", 
                      borderRadius: "4px", 
                      color: "#F4EDE2", 
                      fontWeight: "bold" 
                    }}>
                      {m.sender}
                    </span> 
                    {new Date(m.created_at).toLocaleString()}
                  </div>
                  <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.5", fontSize: "1rem" }}>
                    {m.message_text}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}