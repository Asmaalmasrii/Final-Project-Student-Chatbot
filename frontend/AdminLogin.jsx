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
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-5">
          <div className="p-4">
            <h2 className="mb-4 text-center fw-bold" style={{ color: "#800022", fontSize: "2.5rem" }}>
              Administrative Login
            </h2>

            {err && <div className="alert alert-danger">{err}</div>}

            <form onSubmit={onSubmit} className="d-flex flex-column gap-3">
              <div>
                <label style={{ color: "#800022", fontSize: "1.2rem", fontWeight: "500", marginBottom: "5px" }}>
                  Admin Email:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "#371C23",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    height: "45px",
                    padding: "0 15px",
                    fontSize: "1rem"
                  }}
                  required
                />
              </div>

              <div>
                <label style={{ color: "#800022", fontSize: "1.2rem", fontWeight: "500", marginBottom: "5px" }}>
                  Password:
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: "#371C23",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    height: "45px",
                    padding: "0 15px",
                    fontSize: "1rem"
                  }}
                  required
                />
              </div>

              <div className="text-center mt-3">
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: "#800022",
                    color: "white",
                    borderRadius: "30px",
                    border: "none",
                    padding: "10px 40px",
                    fontSize: "1.1rem",
                    fontWeight: "500",
                    width: "250px",
                    cursor: "pointer"
                  }}
                >
                  {loading ? "Signing in..." : "Login as Admin"}
                </button>
              </div>
            </form>

            <div className="mt-4 text-center fw-bold" style={{ color: "#371C23", fontSize: "1.1rem" }}>
              <Link to="/login" style={{ color: "#371C23", textDecoration: "underline" }}>
                Back to student login
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}