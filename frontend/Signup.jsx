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
          <div className="p-4">
            <h2 className="mb-4 text-center fw-bold" style={{ color: "#800022", fontSize: "2.5rem" }}>
              Welcome
            </h2>

            {err && <div className="alert alert-danger">{err}</div>}

            <form onSubmit={onSubmit} className="d-flex flex-column gap-3">

              <div>
                <label style={{ color: "#800022", fontSize: "1.2rem", fontWeight: "500", marginBottom: "5px" }}>
                  Full Name:
                </label>
                <input
                  type="text"
                  value={full_name}
                  onChange={(e) => setFullName(e.target.value)}
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
                    width: "250px",
                    cursor: "pointer"
                  }}
                >
                  {loading ? "Creating..." : "Create Account"}
                </button>
              </div>

            </form>

            <div className="mt-4 text-center fw-bold" style={{ color: "#371C23", fontSize: "1.1rem" }}>
              Already have an account?{" "}
              <Link to="/login" style={{ color: "#371C23", textDecoration: "underline" }}>
                Sign in
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}