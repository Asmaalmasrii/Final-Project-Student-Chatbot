import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login, loginAsGuest } from "./auth";
import "./index.css"; // make sure this contains your kpu CSS

export default function Login() {
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
      await login(email, password);
      nav("/chat");
    } catch (ex) {
      setErr(ex.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function onGuest() {
    setErr("");
    try {
      setLoading(true);
      await loginAsGuest();
      nav("/chat");
    } catch (ex) {
      setErr(ex.message || "Guest login failed.");
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
              Welcome
            </h2>

            {err && <div className="alert alert-danger">{err}</div>}

            <form onSubmit={onSubmit} className="d-flex flex-column gap-3">

              <div>
                <label style={{ color: "#800022", fontSize: "1.2rem", fontWeight: "500", marginBottom: "5px" }}>
                  Email:
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    backgroundColor: "#371C23",
                    color: "#F4EDE2",
                    border: "none",
                    borderRadius: "8px",
                    height: "45px",
                    padding: "0 15px",
                    fontSize: "1rem"
                  }}
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
                  required
                  style={{
                    width: "100%",
                    backgroundColor: "#371C23",
                    color: "#F4EDE2",
                    border: "none",
                    borderRadius: "8px",
                    height: "45px",
                    padding: "0 15px",
                    fontSize: "1rem"
                  }}
                />
              </div>

              {/* Centered Buttons */}
              <div className="text-center mt-3">
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    backgroundColor: "#800022",
                    color: "#F4EDE2",
                    borderRadius: "30px",
                    border: "none",
                    padding: "10px 40px",
                    fontSize: "1.1rem",
                    fontWeight: "500",
                    width: "200px",
                    cursor: "pointer"
                  }}
                >
                  {loading ? "Signing in..." : "Login"}
                </button>
              </div>

              <div className="text-center mt-2">
                <button
                  type="button"
                  onClick={onGuest}
                  disabled={loading}
                  style={{
                    backgroundColor: "#371C23",
                    color: "#F4EDE2",
                    borderRadius: "30px",
                    border: "none",
                    padding: "10px 40px",
                    fontSize: "1.1rem",
                    fontWeight: "500",
                    width: "250px",
                    cursor: "pointer"
                  }}
                >
                  Continue as Guest
                </button>
              </div>

            </form>

            <div className="mt-4 text-center fw-bold" style={{ color: "#371C23", fontSize: "1.1rem" }}>
              New here?{" "}
              <Link to="/signup" style={{ color: "#371C23", textDecoration: "underline" }}>
                Create an account
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}