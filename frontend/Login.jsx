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
          <div className="card shadow-sm">
            <div className="card-body p-4">
              <h3 className="mb-3 text-center">Welcome </h3>

              {err && <div className="alert alert-danger">{err}</div>}

              <form onSubmit={onSubmit} className="d-flex flex-column gap-3">

                <div>
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@kpu.ca"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Password</label>
                  <input
                    className="form-control"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                {/* Centered KPU Buttons */}
                <div className="text-center">
                  <button
                    className="kpu-btn"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Signing in..." : "Login"}
                  </button>
                </div>

                <div className="text-center">
                  <button
                    type="button"
                    className="kpu-ghost"
                    onClick={onGuest}
                    disabled={loading}
                  >
                    Continue as Guest
                  </button>
                </div>

              </form>

              <div className="mt-4 text-center">
                New here?{" "}
                <Link to="/signup" className="kpu-link">
                  Create an account
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}