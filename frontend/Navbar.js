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
      <nav className="navbar navbar-expand-lg shadow-sm" style={{ backgroundColor: "#960018" }}>
        <div className="container d-flex align-items-center justify-content-between">

          <div className="d-flex align-items-center gap-2">
            <button
              className="kpu-ghost"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              style={{ borderColor: "rgba(255,255,255,0.5)", color: "#111827" }}
            >
              ☰
            </button>

            <Link className="navbar-brand text-white fw-bold mb-0" to="/chat">
              KPU Student Assistant
            </Link>
          </div>

          <div className="d-flex align-items-center gap-3">
            {session ? (
              <>
                <span className="text-white small">{displayName}</span>
                <button className="kpu-ghost" onClick={handleLogout}>Logout</button>
              </>
            ) : (
              <>
                <Link className="kpu-link text-white" to="/login">Login</Link>
                <Link className="kpu-link text-white" to="/signup">Sign Up</Link>
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