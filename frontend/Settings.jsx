import { useEffect, useState } from "react";
import { getSession } from "./auth";
import axios from "axios";

const API_BASE = "http://localhost:8000";

export default function Settings() {
  const session = getSession();
  const [fullName, setFullName] = useState(session?.user?.name || "");
  const [prefTheme, setPrefTheme] = useState("default");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  // password change
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");

  useEffect(() => {
    // later: load preferences from backend if you want
  }, []);

  async function saveProfile() {
    setMsg(""); setErr("");
    try {
      await axios.put(
        `${API_BASE}/settings/profile`,
        { full_name: fullName, preference_theme: prefTheme },
        { withCredentials: true }
      );
      setMsg(" Settings saved");
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to save settings");
    }
  }

  async function changePassword() {
    setMsg(""); setErr("");
    try {
      await axios.put(
        `${API_BASE}/settings/password`,
        { current_password: currentPw, new_password: newPw },
        { withCredentials: true }
      );
      setMsg("Password updated");
      setCurrentPw("");
      setNewPw("");
    } catch (e) {
      setErr(e?.response?.data?.error || "Failed to change password");
    }
  }

  if (!session) return <div className="container py-4">Please login first.</div>;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-5">
          <div className="p-4">
            <h2 className="mb-4 text-center fw-bold" style={{ color: "#800022", fontSize: "2.5rem" }}>
              Settings
            </h2>

            {msg && <div className="alert alert-success">{msg}</div>}
            {err && <div className="alert alert-danger">{err}</div>}

            <div className="mb-5">
              <h4 className="mb-3 fw-bold" style={{ color: "#800022" }}>Profile</h4>

              <div className="d-flex flex-column gap-3">
                <div>
                  <label style={{ color: "#800022", fontSize: "1.2rem", fontWeight: "500", marginBottom: "5px" }}>
                    Full Name:
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
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
                    Theme Preference:
                  </label>
                  <select
                    value={prefTheme}
                    onChange={(e) => setPrefTheme(e.target.value)}
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
                  >
                    <option value="default">Default</option>
                    <option value="high_contrast">High Contrast</option>
                    <option value="compact">Compact</option>
                  </select>
                </div>

                <div className="text-center mt-3">
                  <button
                    onClick={saveProfile}
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
                    Save
                  </button>
                </div>
              </div>
            </div>

            <div>
              <h4 className="mb-3 fw-bold" style={{ color: "#800022" }}>Change Password</h4>

              <div className="d-flex flex-column gap-3">
                <div>
                  <label style={{ color: "#800022", fontSize: "1.2rem", fontWeight: "500", marginBottom: "5px" }}>
                    Current Password:
                  </label>
                  <input
                    type="password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
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
                    New Password:
                  </label>
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
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
                    onClick={changePassword}
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
                    Update Password
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}