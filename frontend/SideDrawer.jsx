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
          background: "#371C23",
          zIndex: 1000,
          transform: open ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 180ms ease",
          boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
          padding: 16,
          display: "flex",
          flexDirection: "column",
          gap: 12,
          color: "#F4EDE2"
        }}
      >
        <div className="d-flex align-items-center justify-content-between">
          <div style={{ fontWeight: 800, fontSize: "1.2rem" }}>Menu</div>
          <button 
            className="btn" 
            style={{ color: "#F4EDE2", border: "1px solid rgba(255,255,255,0.5)", borderRadius: "30px", padding: "4px 12px" }} 
            onClick={onClose}
          >
            Close
          </button>
        </div>

        <div className="small" style={{ color: "rgba(255,255,255,0.7)" }}>
          {session ? `Signed in as: ${displayName}` : "Not signed in"}
        </div>

        <hr className="my-2" style={{ borderColor: "rgba(255,255,255,0.2)" }} />

        <Link 
          to="/chat" 
          onClick={onClose}
          style={{ textDecoration: "none", color: "#F4EDE2", padding: "8px 0", fontWeight: "500", fontSize: "1.1rem" }}
        >
          Chat
        </Link>

        {/* If NOT logged in show Admin Login */}
        {!session && (
          <Link 
            to="/admin-login" 
            onClick={onClose}
            style={{ textDecoration: "none", color: "#F4EDE2", padding: "8px 0", fontWeight: "500", fontSize: "1.1rem" }}
          >
            Administrative Login
          </Link>
        )}

        {/* If logged in show Settings + History */}
        {session && (
          <>
            <Link 
              to="/settings" 
              onClick={onClose}
              style={{ textDecoration: "none", color: "#F4EDE2", padding: "8px 0", fontWeight: "500", fontSize: "1.1rem" }}
            >
              Settings
            </Link>
            <Link 
              to="/history" 
              onClick={onClose}
              style={{ textDecoration: "none", color: "#F4EDE2", padding: "8px 0", fontWeight: "500", fontSize: "1.1rem" }}
            >
              Previous Messages
            </Link>
          </>
        )}

        {/* If logged in as admin show Admin FAQ Panel */}
        {session?.user?.role === "admin" && (
          <Link 
            to="/admin/faqs" 
            onClick={onClose}
            style={{ textDecoration: "none", color: "#F4EDE2", padding: "8px 0", fontWeight: "500", fontSize: "1.1rem" }}
          >
            Admin FAQ Panel
          </Link>
        )}

        <div style={{ marginTop: "auto", color: "rgba(255,255,255,0.5)" }} className="small">
          KPU Student Assistant
        </div>
      </div>
    </>
  );
}