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

  return (
    <div className="container py-4" style={{ maxWidth: 900 }}>
      <h3 className="mb-3">Previous Messages</h3>
      {err && <div className="alert alert-danger">{err}</div>}

      <div className="card">
        <div className="card-body">
          {items.length === 0 ? (
            <div className="text-muted">No messages yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {items.map((m) => (
                <div key={m.id} style={{ padding: 10, border: "1px solid #eee", borderRadius: 10 }}>
                  <div className="small text-muted">
                    {m.created_at} • <b>{m.sender}</b>
                  </div>
                  <div style={{ whiteSpace: "pre-wrap" }}>{m.message_text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}