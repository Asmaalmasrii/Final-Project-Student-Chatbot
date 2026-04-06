import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { register } from "./auth";
import "./index.css";

export default function Signup() {
  const [full_name, setFullName] = useState("");
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
      await register(full_name, email, password);
      nav("/chat"); // auto login
    } catch (ex) {
      setErr(ex.message || "Registration failed.");
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
              <h3 className="mb-3 text-center">Create Account</h3>

              {err && <div className="alert alert-danger">{err}</div>}

              <form onSubmit={onSubmit} className="d-flex flex-column gap-3">

                <div>
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-control"
                    value={full_name}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

                {/* Centered Rounded Button */}
                <div className="text-center">
                  <button
                    className="kpu-btn"
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? "Creating..." : "Create Account"}
                  </button>
                </div>

              </form>

              <div className="mt-4 text-center">
                Already have an account?{" "}
                <Link to="/login" className="kpu-link">
                  Sign in
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}