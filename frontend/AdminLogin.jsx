import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { setSession } from "./auth";

const API_BASE = "http://localhost:8000";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");

    try {
      setLoading(true);

      const res = await axios.post(
        `${API_BASE}/login`,
        { email, password },
        { withCredentials: true, headers: { "Content-Type": "application/json" } }
      );

      const user = res.data?.user;
      if (!user || user.role !== "admin") {
        setErr("Admin access required.");
        return;
      }

      // Store session locally for UI routing
      setSession({
        token: "cookie-session",
        user: {
          id: user.id,
          email: user.email,
          name: user.full_name || user.email,
          role: user.role,
        },
        isGuest: false,
      });

      nav("/admin/faqs");
    } catch (e2) {
      setErr(e2?.response?.data?.error || "Admin login failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container py-5" style={{ maxWidth: 520 }}>
      <div className="card shadow-sm">
        <div className="card-body p-4">
          <h3 className="mb-3 text-center">Administrative Login</h3>

          {err && <div className="alert alert-danger">{err}</div>}

          <form onSubmit={onSubmit} className="d-flex flex-column gap-3">
            <div>
              <label className="form-label">Admin Email</label>
              <input className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div>
              <label className="form-label">Password</label>
              <input className="form-control" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>

            <div className="text-center">
              <button className="kpu-btn" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Login as Admin"}
              </button>
            </div>
          </form>

          <div className="mt-3 text-center">
            <Link to="/login" className="kpu-link">Back to student login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}