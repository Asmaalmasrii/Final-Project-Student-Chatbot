import axios from "axios";

const API_BASE = "http://localhost:8000";
const SESSION_KEY = "auth_session";

// IMPORTANT for Flask cookie sessions
const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export function setSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logoutLocal() {
  localStorage.removeItem(SESSION_KEY);
}

/* ------------------ REGISTER ------------------ */
export async function register(full_name, email, password) {
  full_name = (full_name || "").trim();
  email = (email || "").trim().toLowerCase();

  if (!full_name) throw new Error("Name is required.");
  if (!email || !password) throw new Error("Email and password are required.");
  if (password.length < 6)
    throw new Error("Password must be at least 6 characters.");

  try {
    const res = await api.post("/signup", {
      full_name,
      email,
      password,
    });

    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.error || "Registration failed.";
    throw new Error(msg);
  }
}

/* LOGIN */
export async function login(email, password) {
  email = (email || "").trim().toLowerCase();

  if (!email || !password)
    throw new Error("Email and password are required.");

  try {
    const res = await api.post("/login", { email, password });

    const u = res.data?.user;
    if (!u) throw new Error("Login failed.");

    const session = {
      token: "flask-session",
      user: {
        id: u.id,
        name: u.full_name || "",
        email: u.email,
        role: u.role || "student",
      },
      isGuest: false,
    };

    setSession(session);
    return session;
  } catch (err) {
    const msg = err?.response?.data?.error || "Invalid credentials.";
    throw new Error(msg);
  }
}

/* ------------------ LOGOUT ------------------ */
export async function logout() {
  try {
    await api.post("/logout");
  } catch {}
  logoutLocal();
}

/* ------------------ GUEST ------------------ */
export async function loginAsGuest() {
  try {
    await api.post("/guest");

    const session = {
      token: "guest",
      user: { id: "guest", email: "Guest", role: "guest" },
      isGuest: true,
    };

    setSession(session);
    return session;
  } catch (err) {
    throw new Error("Guest login failed.");
  }
}

/* ------------------ CHAT ------------------ */
export async function sendChat(message, sender) {
  if (!message?.trim()) throw new Error("Message is required.");

  try {
    const payload = sender ? { message, sender } : { message };
    const res = await api.post("/chat", payload);
    return res.data;
  } catch (err) {
    const msg = err?.response?.data?.error || "Chat failed.";
    throw new Error(msg);
  }
}