import { Navigate } from "react-router-dom";
import { getSession } from "./auth";

export default function AdminRoute({ children }) {
  const session = getSession();

  if (!session) return <Navigate to="/admin-login" replace />;

  const role = session?.user?.role;
  if (role !== "admin") return <Navigate to="/chat" replace />;

  return children;
}