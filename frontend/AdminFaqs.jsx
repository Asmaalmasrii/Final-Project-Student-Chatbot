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
      setMsg(" Deleted");
      loadFaqs();
    } catch (e) {
      setErr(e?.response?.data?.error || "Delete failed.");
    }
  }

  async function reindexFaqs() {
    setErr(""); setMsg("");
    try {
      await axios.post(`${API_BASE}/admin/reindex_faqs`, {}, { withCredentials: true });
      setMsg(" Reindex complete");
    } catch (e) {
      setErr(e?.response?.data?.error || "Reindex failed.");
    }
  }

  return (
    <div className="container py-4" style={{ maxWidth: 1000 }}>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h3 className="mb-0">Admin FAQ Panel</h3>
        <button className="kpu-ghost" onClick={reindexFaqs}>Reindex FAQs</button>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-danger">{err}</div>}

      <div className="card mb-3">
        <div className="card-body">
          <h5 className="mb-3">Create FAQ</h5>

          <label className="form-label">Question</label>
          <textarea className="form-control mb-2" rows={2} value={question} onChange={(e) => setQuestion(e.target.value)} />

          <label className="form-label">Answer</label>
          <textarea className="form-control mb-2" rows={3} value={answer} onChange={(e) => setAnswer(e.target.value)} />

          <div className="row g-2">
            <div className="col-md-4">
              <label className="form-label">Category</label>
              <input className="form-control" value={category} onChange={(e) => setCategory(e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Tags (comma-separated)</label>
              <input className="form-control" value={tags} onChange={(e) => setTags(e.target.value)} />
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <div className="form-check">
                <input className="form-check-input" type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} />
                <label className="form-check-label">Published</label>
              </div>
            </div>
          </div>

          <div className="mt-3 text-center">
            <button className="kpu-btn" onClick={createFaq}>Create</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="mb-3">FAQ List (from Database)</h5>

          {faqs.length === 0 ? (
            <div className="text-muted">No FAQs yet.</div>
          ) : (
            <div className="d-flex flex-column gap-2">
              {faqs.map((f) => (
                <div key={f.id} className="p-3" style={{ border: "1px solid #eee", borderRadius: 12 }}>
                  <div className="d-flex justify-content-between gap-2">
                    <div style={{ flex: 1 }}>
                      <div className="fw-bold">{f.question}</div>
                      <div className="text-muted small">
                        {f.category || "Uncategorized"} • {f.published ? "Published" : "Hidden"}
                      </div>
                      <div style={{ whiteSpace: "pre-wrap" }} className="mt-2">{f.answer}</div>
                      {f.tags && <div className="text-muted small mt-2">Tags: {f.tags}</div>}
                    </div>

                    <div>
                      <button className="kpu-ghost" onClick={() => deleteFaq(f.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}