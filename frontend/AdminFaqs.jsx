import { useEffect, useState } from "react";
import axios from "axios";

const API_BASE = "http://localhost:8000";

export default function AdminFaqs() {
  const [faqs, setFaqs] = useState([]);
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [published, setPublished] = useState(true);

  async function loadFaqs() {
    setErr(""); setMsg("");
    try {
      const res = await axios.get(`${API_BASE}/admin/faqs`, { withCredentials: true });
      setFaqs(res.data || []);
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to load FAQs.");
    }
  }

  useEffect(() => { loadFaqs(); }, []);

  async function createFaq() {
    setErr(""); setMsg("");
    try {
      await axios.post(
        `${API_BASE}/admin/faqs`,
        { question, answer, category, tags, published },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      setQuestion(""); setAnswer(""); setCategory(""); setTags(""); setPublished(true);
      setMsg("✅ FAQ created");
      loadFaqs();
    } catch (e) {
      setErr(e?.response?.data?.error || "Create failed.");
    }
  }

  async function deleteFaq(id) {
    setErr(""); setMsg("");
    try {
      await axios.delete(`${API_BASE}/admin/faqs/${id}`, { withCredentials: true });
      setMsg("✅ Deleted");
      loadFaqs();
    } catch (e) {
      setErr(e?.response?.data?.error || "Delete failed.");
    }
  }

  async function reindexFaqs() {
    setErr(""); setMsg("");
    try {
      await axios.post(`${API_BASE}/admin/reindex_faqs`, {}, { withCredentials: true });
      setMsg("✅ Reindex complete");
    } catch (e) {
      setErr(e?.response?.data?.error || "Reindex failed.");
    }
  }

  // Common styling tokens
  const containerStyle = { maxWidth: 1000, margin: "0 auto", padding: "40px 15px" };
  const titleStyle = { color: "#800022", fontSize: "2.2rem", fontWeight: "700", margin: 0 };
  const cardStyle = {
    backgroundColor: "#371C23",
    color: "#F4EDE2",
    borderRadius: "15px",
    padding: "30px",
    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
    marginBottom: "30px"
  };
  const labelStyle = { color: "#F4EDE2", fontSize: "1.1rem", fontWeight: "500", marginBottom: "8px", display: "block" };
  const inputStyle = {
    width: "100%",
    backgroundColor: "#F4EDE2",
    color: "#371C23",
    border: "2px solid transparent",
    borderRadius: "8px",
    padding: "12px 15px",
    fontSize: "1rem",
    outline: "none",
    transition: "border 0.2s ease"
  };
  const buttonStyle = {
    backgroundColor: "#800022",
    color: "#F4EDE2",
    borderRadius: "30px",
    border: "none",
    padding: "10px 30px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "background 0.2s ease, transform 0.1s ease",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
  };

  const reindexButtonStyle = {
    backgroundColor: "#F4EDE2",
    color: "#800022",
    borderRadius: "30px",
    border: "2px solid #800022",
    padding: "8px 24px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.2s ease"
  };

  return (
    <div style={containerStyle}>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <h3 style={titleStyle}>Admin FAQ Panel</h3>
        <button 
          style={reindexButtonStyle} 
          onClick={reindexFaqs}
          onMouseOver={(e) => { e.target.style.backgroundColor = '#800022'; e.target.style.color = '#F4EDE2'; }}
          onMouseOut={(e) => { e.target.style.backgroundColor = '#F4EDE2'; e.target.style.color = '#800022'; }}
        >
          Reindex FAQs
        </button>
      </div>

      {msg && (
        <div style={{ backgroundColor: "#371C23", color: "#F4EDE2", padding: "15px 20px", borderRadius: "10px", marginBottom: "20px", borderLeft: "5px solid #4ade80", fontWeight: "500" }}>
          {msg}
        </div>
      )}
      {err && (
        <div style={{ backgroundColor: "#371C23", color: "#F4EDE2", padding: "15px 20px", borderRadius: "10px", marginBottom: "20px", borderLeft: "5px solid #f87171", fontWeight: "500" }}>
          {err}
        </div>
      )}

      {/* CREATE FAQ CARD */}
      <div style={cardStyle}>
        <h4 className="mb-4 fw-bold" style={{ color: "#F4EDE2", borderBottom: "1px solid rgba(244,237,226,0.2)", paddingBottom: "10px" }}>Create FAQ</h4>

        <div className="mb-3">
          <label style={labelStyle}>Question</label>
          <textarea 
            style={{ ...inputStyle, resize: "vertical", minHeight: "60px" }} 
            rows={2} 
            value={question} 
            onChange={(e) => setQuestion(e.target.value)} 
            placeholder="Type the student's question here..."
          />
        </div>

        <div className="mb-3">
          <label style={labelStyle}>Answer (Markdown Supported)</label>
          <textarea 
            style={{ ...inputStyle, resize: "vertical", minHeight: "100px" }} 
            rows={4} 
            value={answer} 
            onChange={(e) => setAnswer(e.target.value)} 
            placeholder="Provide a comprehensive answer..."
          />
        </div>

        <div className="row g-3 mb-4">
          <div className="col-md-5">
            <label style={labelStyle}>Category</label>
            <input style={inputStyle} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Admissions" />
          </div>
          <div className="col-md-5">
            <label style={labelStyle}>Tags (comma-separated)</label>
            <input style={inputStyle} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. international, fee" />
          </div>
          <div className="col-md-2 d-flex align-items-end mb-2">
            <div className="form-check d-flex align-items-center gap-2" style={{ cursor: "pointer" }}>
              <input 
                className="form-check-input mt-0" 
                type="checkbox" 
                checked={published} 
                onChange={(e) => setPublished(e.target.checked)} 
                style={{ width: "20px", height: "20px", cursor: "pointer" }}
              />
              <label className="form-check-label mb-0" style={{ color: "#F4EDE2", fontWeight: "500", cursor: "pointer" }} onClick={() => setPublished(!published)}>
                Published
              </label>
            </div>
          </div>
        </div>

        <div className="text-end">
          <button 
            style={buttonStyle} 
            onClick={createFaq}
            onMouseOver={(e) => { e.target.style.transform = 'translateY(-2px)'; e.target.style.backgroundColor = '#960018'; }}
            onMouseOut={(e) => { e.target.style.transform = 'translateY(0)'; e.target.style.backgroundColor = '#800022'; }}
          >
            + Create Action
          </button>
        </div>
      </div>

      {/* FAQ LIST CARD */}
      <div style={cardStyle}>
        <h4 className="mb-4 fw-bold" style={{ color: "#F4EDE2", borderBottom: "1px solid rgba(244,237,226,0.2)", paddingBottom: "10px" }}>FAQ List (from Database)</h4>

        {faqs.length === 0 ? (
          <div style={{ color: "rgba(244,237,226,0.6)", fontStyle: "italic", textAlign: "center", padding: "20px 0" }}>No FAQs yet. Create one above!</div>
        ) : (
          <div className="d-flex flex-column gap-3">
            {faqs.map((f) => (
              <div key={f.id} style={{ backgroundColor: "rgba(244,237,226, 0.06)", borderRadius: "12px", padding: "20px", border: "1px solid rgba(244,237,226, 0.1)", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "1.2rem", fontWeight: "700", marginBottom: "5px" }}>{f.question}</div>
                  <div style={{ color: "#F4EDE2", opacity: 0.7, fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "15px" }}>
                    <span style={{ backgroundColor: "#800022", padding: "3px 8px", borderRadius: "4px", marginRight: "10px", color: "white", fontWeight: "bold" }}>
                      {f.category || "General"}
                    </span> 
                    {f.published ? "🟢 Published" : "🔴 Hidden"}
                  </div>
                  <div style={{ whiteSpace: "pre-wrap", lineHeight: "1.5", fontSize: "0.95rem", color: "rgba(244,237,226,0.9)" }}>
                    {f.answer}
                  </div>
                  {f.tags && (
                    <div style={{ marginTop: "15px", color: "#F4EDE2", opacity: 0.6, fontSize: "0.85rem" }}>
                      <strong>Tags:</strong> {f.tags}
                    </div>
                  )}
                </div>

                <div>
                  <button 
                    style={{ ...reindexButtonStyle, padding: "6px 16px", fontSize: "0.85rem", border: "1px solid rgba(244,237,226,0.3)", backgroundColor: "transparent", color: "#f87171" }}
                    onClick={() => deleteFaq(f.id)}
                    onMouseOver={(e) => { e.target.style.backgroundColor = 'rgba(248,113,113,0.1)'; e.target.style.borderColor = '#f87171'; }}
                    onMouseOut={(e) => { e.target.style.backgroundColor = 'transparent'; e.target.style.borderColor = 'rgba(244,237,226,0.3)'; }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}