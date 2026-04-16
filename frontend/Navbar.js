import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { getSession, logout } from "./auth";
import SideDrawer from "./SideDrawer";
import "./index.css"; // where your kpu-btn / kpu-link styles live

export default function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const session = getSession();
  const nav = useNavigate();

  async function handleLogout() {
    await logout(); // calls Flask /logout + clears local
    nav("/login");
  }

  const displayName = session?.isGuest
    ? "Guest"
    : (session?.user?.name || session?.user?.full_name || session?.user?.email || "User");

  return (
    <>
      <nav className="navbar navbar-expand-lg border-0 p-0" style={{ backgroundColor: "transparent" }}>
        <div className="container-fluid px-4 d-flex align-items-center justify-content-between">

          <div className="d-flex align-items-center gap-3">
            <button
              className="btn d-flex align-items-center justify-content-center"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              style={{ backgroundColor: "#800022", color: "white", border: "none", borderRadius: "8px", width: "70px", height: "36px", fontSize: "20px", padding: 0, fontWeight: "600" }}
            >
              MENU
            </button>

            <Link className="navbar-brand fw-bold mb-0" to="/chat" style={{ color: "#800022", fontSize: "28px", fontFamily: "'Playfair Display', serif" }}>
              KPU CHAT
            </Link>
          </div>

          <div className="d-flex align-items-center gap-3">
            {session ? (
              <>
                <span style={{ color: "#800022", fontWeight: "bold", fontSize: "18px" }}>{displayName}</span>
                <button onClick={handleLogout} style={{ backgroundColor: "#800022", color: "white", border: "none", borderRadius: "8px", padding: "6px 16px", fontWeight: "bold", letterSpacing: "1px" }}>
                  LOGOUT
                </button>
              </>
            ) : (
              <>
                <Link className="kpu-link" style={{ color: "#800022", fontWeight: "bold" }} to="/login">LOGIN</Link>
                <Link className="kpu-link" style={{ color: "#800022", fontWeight: "bold" }} to="/signup">SIGN UP</Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <SideDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        session={session}
      />
    </>
  );
}