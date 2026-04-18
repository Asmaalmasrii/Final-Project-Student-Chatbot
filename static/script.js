// ---- API endpoints (served from Flask, same origin) ----
const API = {
    me: "/me",
    login: "/login",
    signup: "/signup",
    logout: "/logout",
    chat: "/chat",
    history: "/history"
};

// ---- Sender ID per browser (stored) ----
function uuidv4() {
    // Simple UUID generator for browser usage
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0, v = c === "x" ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

const senderKeyStorage = "kpu_sender_id";
let SENDER_ID = localStorage.getItem(senderKeyStorage);
if (!SENDER_ID) {
    SENDER_ID = uuidv4();
    localStorage.setItem(senderKeyStorage, SENDER_ID);
}
document.getElementById("senderView").textContent = SENDER_ID;

// ---- UI elements ----
const chat = document.getElementById("chat");
const input = document.getElementById("message");
const sendBtn = document.getElementById("send");
const historyList = document.getElementById("historyList");
const newChatBtn = document.getElementById("newChatBtn");

const tabLogin = document.getElementById("tabLogin");
const tabSignup = document.getElementById("tabSignup");
const loginPane = document.getElementById("loginPane");
const signupPane = document.getElementById("signupPane");

const okBox = document.getElementById("okBox");
const errBox = document.getElementById("errBox");

const apiDot = document.getElementById("apiDot");
const apiText = document.getElementById("apiText");
const userText = document.getElementById("userText");
const logoutBtn = document.getElementById("logoutBtn");

function showOk(msg) {
    okBox.textContent = msg;
    okBox.style.display = "block";
    errBox.style.display = "none";
}

function showErr(msg) {
    errBox.textContent = msg;
    errBox.style.display = "block";
    okBox.style.display = "none";
}

function clearAlerts() {
    okBox.style.display = "none";
    errBox.style.display = "none";
    okBox.textContent = "";
    errBox.textContent = "";
}

function addMessage(text, who) {
    const div = document.createElement("div");
    div.className = `msg ${who}`;
    div.textContent = text;
    chat.appendChild(div);
    chat.scrollTop = chat.scrollHeight;
}

function setAuthUI(isLoggedIn, role, userId) {
    if (isLoggedIn) {
        userText.textContent = `Logged in • ${role} • id ${userId}`;
        logoutBtn.style.display = "inline-block";
    } else {
        userText.textContent = "Not logged in";
        logoutBtn.style.display = "none";
    }
}

// ---- Tabs ----
tabLogin.addEventListener("click", () => {
    tabLogin.classList.add("active");
    tabSignup.classList.remove("active");
    loginPane.style.display = "block";
    signupPane.style.display = "none";
    clearAlerts();
});

tabSignup.addEventListener("click", () => {
    tabSignup.classList.add("active");
    tabLogin.classList.remove("active");
    signupPane.style.display = "block";
    loginPane.style.display = "none";
    clearAlerts();
});

// ---- Auth calls ----
async function apiGet(url) {
    const res = await fetch(url, { method: "GET", credentials: "include" });
    return res.json();
}

async function apiPost(url, body) {
    const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body || {})
    });
    const data = await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, data };
}

async function refreshMe() {
    try {
        const me = await apiGet(API.me);
        setAuthUI(!!me.logged_in, me.role, me.user_id);
        apiDot.className = "dot good";
        apiText.textContent = "Backend online";
    } catch (e) {
        apiDot.className = "dot bad";
        apiText.textContent = "Backend offline";
        setAuthUI(false);
    }
    loadHistory();
}

async function loadHistory() {
    if (userText.textContent === "Not logged in") {
        historyList.innerHTML = `<div class="note">Login to see past conversations.</div>`;
        return;
    }
    historyList.innerHTML = `<div class="note">Loading history...</div>`;
    try {
        const res = await fetch(API.history, { credentials: "include" });
        if (!res.ok) {
            historyList.innerHTML = `<div class="note">Endpoint /history not yet implemented in app.py.</div>`;
            return;
        }
        const sessions = await res.json();
        if (!Array.isArray(sessions) || sessions.length === 0) {
            historyList.innerHTML = `<div class="note">No past conversations.</div>`;
            return;
        }
        historyList.innerHTML = "";
        sessions.forEach(s => {
            const div = document.createElement("div");
            div.className = "history-item";
            div.innerHTML = `<div>Chat #${s.id}</div><div class="date">${new Date(s.started_at).toLocaleString()}</div>`;
            div.onclick = () => alert("Loading past chats requires a backend update.");
            historyList.appendChild(div);
        });
    } catch (e) {
        historyList.innerHTML = `<div class="note">Failed to load history.</div>`;
    }
}

newChatBtn.addEventListener("click", () => {
    SENDER_ID = uuidv4();
    localStorage.setItem(senderKeyStorage, SENDER_ID);
    document.getElementById("senderView").textContent = SENDER_ID;
    chat.innerHTML = "";
    addMessage("Started a new conversation! How can I help?", "bot");
});

document.getElementById("loginBtn").addEventListener("click", async () => {
    clearAlerts();
    const email = document.getElementById("loginEmail").value.trim();
    const password = document.getElementById("loginPassword").value;

    if (!email || !password) {
        showErr("Please enter email and password.");
        return;
    }

    const { ok, data } = await apiPost(API.login, { email, password });
    if (!ok) {
        showErr(data.error || "Login failed.");
        return;
    }

    showOk("Login successful.");
    await refreshMe();
});

document.getElementById("signupBtn").addEventListener("click", async () => {
    clearAlerts();
    const full_name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    if (!email || !password) {
        showErr("Please enter email and password.");
        return;
    }

    const { ok, status, data } = await apiPost(API.signup, { email, password, full_name });
    if (!ok) {
        if (status === 409) showErr("Email already exists. Try logging in instead.");
        else showErr(data.error || "Signup failed.");
        return;
    }

    showOk("Account created. You can login now.");
    tabLogin.click();
    document.getElementById("loginEmail").value = email;
    document.getElementById("loginPassword").value = "";
});

logoutBtn.addEventListener("click", async () => {
    clearAlerts();
    const { ok, data } = await apiPost(API.logout, {});
    if (!ok) {
        showErr(data.error || "Logout failed.");
        return;
    }
    showOk("Logged out.");
    await refreshMe();
});

// ---- Chat ----
async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, "user");
    input.value = "";

    try {
        const res = await fetch(API.chat, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sender: SENDER_ID, message: text })
        });

        const data = await res.json().catch(() => null);

        if (!res.ok) {
            const msg = (data && (data.error || data.details)) ? (data.error + (data.details ? (": " + data.details) : "")) : "Chat request failed.";
            addMessage(msg, "bot");
            return;
        }

        if (Array.isArray(data) && data.length > 0) {
            data.forEach(m => {
                if (m && m.text) addMessage(m.text, "bot");
            });
        } else {
            addMessage("No response from bot.", "bot");
        }
    } catch (err) {
        addMessage("Error connecting to backend (is Flask running on port 8000?)", "bot");
        console.error(err);
    }
}

sendBtn.addEventListener("click", sendMessage);
input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
});

const accountToggleBtn = document.getElementById("accountToggleBtn");
const accountDropdownContainer = document.getElementById("accountDropdownContainer");

accountToggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (accountDropdownContainer.style.display === "none") {
        accountDropdownContainer.style.display = "block";
    } else {
        accountDropdownContainer.style.display = "none";
    }
});

document.addEventListener("click", (e) => {
    if (!accountDropdownContainer.contains(e.target)) {
        accountDropdownContainer.style.display = "none";
    }
});

// Initial
addMessage("Hi! You can sign up/login on the top right, then ask me questions.", "bot");
refreshMe();