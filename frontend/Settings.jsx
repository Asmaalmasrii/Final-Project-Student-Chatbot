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
    <div className="container py-4" style={{ maxWidth: 720 }}>
      <h3 className="mb-3">Settings</h3>

      {msg && <div className="alert alert-success">{msg}</div>}
      {err && <div className="alert alert-danger">{err}</div>}

      <div className="card mb-3">
        <div className="card-body">
          <h5 className="mb-3">Profile</h5>

          <label className="form-label">Full Name</label>
          <input className="form-control mb-3" value={fullName} onChange={(e) => setFullName(e.target.value)} />

          <label className="form-label">Theme Preference</label>
          <select className="form-select mb-3" value={prefTheme} onChange={(e) => setPrefTheme(e.target.value)}>
            <option value="default">Default</option>
            <option value="high_contrast">High Contrast</option>
            <option value="compact">Compact</option>
          </select>

          <button className="kpu-btn" onClick={saveProfile}>Save</button>
        </div>
      </div>

      <div className="card">
        <div className="card-body">
          <h5 className="mb-3">Change Password</h5>

          <label className="form-label">Current Password</label>
          <input className="form-control mb-3" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />

          <label className="form-label">New Password</label>
          <input className="form-control mb-3" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />

          <button className="kpu-btn" onClick={changePassword}>Update Password</button>
        </div>
      </div>
    </div>
  );
}