import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import Chat from "./Chat";
import ProtectedRoute from "./ProtectedRoute";
import Navbar from "./Navbar";
import Settings from "./Settings";
import History from "./History.jsx";
import AdminLogin from "./AdminLogin";
import AdminFaqs from "./AdminFaqs";
import AdminRoute from "./AdminRoute";
import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        {/* Default route */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth routes (lowercase paths) */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        <Route path="/history" element={<ProtectedRoute><History /></ProtectedRoute>} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route
          path="/admin/faqs"
          element={
            <AdminRoute>
              <AdminFaqs />
            </AdminRoute>
          }
        />

        {/* Protected route */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <Chat />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}