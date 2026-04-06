import { Link } from "react-router-dom";

export default function SideDrawer({ open, onClose, session }) {
  const displayName = session?.isGuest
    ? "Guest"
    : (session?.user?.name || session?.user?.full_name || session?.user?.email || "User");

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            zIndex: 999,
          }}
        />
      )}

      {/* Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          height: "100vh",
          width: 280,
          background: "#fff",
          zIndex: 1000,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 180ms ease",
          boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
        }}
      >
        <div className="d-flex align-items-center justify-content-between">
          <div style={{ fontWeight: 800 }}>Menu</div>
          <button className="kpu-ghost" onClick={onClose}>Close</button>
        </div>

        <div className="small text-muted">
          {session ? `Signed in as: ${displayName}` : "Not signed in"}
        </div>

        <hr className="my-2" />

        <Link className="kpu-link" to="/chat" onClick={onClose}>Chat</Link>

        {/* If NOT logged in show Admin Login */}
        {!session && (
          <Link className="kpu-link" to="/admin-login" onClick={onClose}>
            Administrative Login
          </Link>
        )}

        {/* If logged in show Settings + History */}
        {session && (
          <>
            <Link className="kpu-link" to="/settings" onClick={onClose}>
              Settings
            </Link>
            <Link className="kpu-link" to="/history" onClick={onClose}>
              Previous Messages
            </Link>
          </>
        )}

        <div style={{ marginTop: "auto" }} className="small text-muted">
          KPU Student Assistant
        </div>
      </div>
    </>
  );
}