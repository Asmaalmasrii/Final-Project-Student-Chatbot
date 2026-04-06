import { useState, useRef, useEffect } from "react";
import { getSession } from "./auth";
import { sendChat } from "./auth";
import "./index.css";

function TypingDots() {
  return (
    <span className="typing-dots" aria-label="Typing">
      <span className="dot" />
      <span className="dot" />
      <span className="dot" />
    </span>
  );
}

export default function Chat() {
  const session = getSession();
  const sender = session ? `user_${session.user.id}` : "anonymous";

  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! Ask me about KPU admissions or courses." }
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  const [showTopBtn, setShowTopBtn] = useState(false);
  const [showBottomBtn, setShowBottomBtn] = useState(false);
  const [isNearBottom, setIsNearBottom] = useState(true);

  const chatRef = useRef(null);
  const bottomRef = useRef(null);

  // Track scroll position (top button + bottom button + near-bottom detection)
  useEffect(() => {
    const el = chatRef.current;
    if (!el) return;

    const handleScroll = () => {
      const top = el.scrollTop;
      const distanceFromBottom = el.scrollHeight - (el.scrollTop + el.clientHeight);

      setShowTopBtn(top > 150);

      const nearBottom = distanceFromBottom < 120; // threshold
      setIsNearBottom(nearBottom);
      setShowBottomBtn(!nearBottom);
    };

    el.addEventListener("scroll", handleScroll);
    handleScroll(); // init
    return () => el.removeEventListener("scroll", handleScroll);
  }, []);

  // Auto-scroll to bottom ONLY if user is near bottom
  useEffect(() => {
    if (!isNearBottom) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, busy, isNearBottom]);

  function scrollToTop() {
    chatRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  }

  function scrollToBottom() {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  async function send() {
    const text = input.trim();
    if (!text || busy) return;

    setMessages((m) => [...m, { from: "user", text }]);
    setInput("");
    setBusy(true);

    // If user sends a message, we want to go bottom
    setTimeout(() => scrollToBottom(), 0);

    try {
      const data = await sendChat(text, sender);
      const botMsgs = (data || []).map((x) => ({
        from: "bot",
        text: x.text || "[no text]"
      }));
      setMessages((m) => [...m, ...botMsgs]);
    } catch {
      setMessages((m) => [
        ...m,
        { from: "bot", text: " Can't reach server." }
      ]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-vh-200" style={{ background: "#F4F7FB" }}>
      <div className="container py-4" style={{ maxWidth: 1000 }}>
        <div
          className="card shadow-sm border-0"
          style={{ borderRadius: 16, position: "relative" }}
        >
          {/* Scrollable Chat Body */}
          <div
            ref={chatRef}
            className="card-body"
            style={{
              height: 520,
              overflowY: "auto",
              background: "white",
              borderTopLeftRadius: 16,
              border: "1px solid #010712",
              borderTopRightRadius: 16
            }}
          >
            {messages.map((msg, i) => {
              const isUser = msg.from === "user";
              return (
                <div
                  key={i}
                  className={`d-flex mb-2 fade-in ${
                    isUser ? "justify-content-end" : "justify-content-start"
                  }`}
                >
                  <div
                    className="px-3 py-2"
                    style={{
                      maxWidth: "75%",
                      borderRadius: isUser
                        ? "18px 18px 6px 18px"
                        : "18px 18px 18px 6px",
                      background: isUser ? "#2087e8" : "#F8FAFC",
                      color: isUser ? "white" : "#111827",
                      border: isUser ? "none" : "1px solid #E5E7EB",
                      boxShadow: isUser ? "none" : "0 2px 6px rgba(0,0,0,0.06)",
                      whiteSpace: "pre-wrap",
                      lineHeight: 1.45
                    }}
                  >
                    <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 2, fontWeight: "bold", }}>
                      {isUser ? "You" : "KPU Bot"}
                    </div>
                    <div style={{ fontSize: 16 }}>{msg.text}</div>
                  </div>
                </div>
              );
            })}

            {busy && (
              <div className="d-flex justify-content-start mb-2 fade-in">
                <div
                  className="px-3 py-2"
                  style={{
                    maxWidth: "75%",
                    borderRadius: "18px 18px 18px 6px",
                    background: "#F8FAFC",
                    border: "1px solid #E5E7EB",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.06)"
                  }}
                >
                  <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 2 }}>
                    KPU Bot
                  </div>
                  <div style={{ fontSize: 15 }}>
                    <TypingDots />
                  </div>
                </div>
              </div>
            )}

            {/* anchor */}
            <div ref={bottomRef} />
          </div>

          {/* Floating Back To Top */}
          {showTopBtn && (
            <button
              onClick={scrollToTop}
              className="kpu-btn"
              style={{
                position: "absolute",
                right: 18,
                bottom: 78,
                width: 30,
                height: 30,
                borderRadius: "50%",
                padding: 0,
                display: "grid",
                placeItems: "center",
                marginBottom: 22,
                fontSize: 12,
                boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
                zIndex: 10
              }}
              title="Back to top"
            >
              ↑
            </button>
          )}

          {/* Floating Scroll To Bottom */}
          {showBottomBtn && (
            <button
              onClick={scrollToBottom}
              className="kpu-btn"
              style={{
                position: "absolute",
                right: 70,
                bottom: 78,
                width: 30,
                height: 30,
                borderRadius: "50%",
                padding: 0,
                display: "grid",
                placeItems: "center",
                marginBottom: 22,
                fontSize: 18,
                boxShadow: "0 8px 18px rgba(0,0,0,0.18)",
                zIndex: 10
              }}
              title="Jump to latest"
            >
              ↓
            </button>
          )}

          {/* Input Area */}
          <div
            className="p-2"
            style={{
              background: "#FAFBFF",
              borderTop: "1px solid #E5E7EB",
              borderBottomLeftRadius: 16,
              borderBottomRightRadius: 16
            }}
          >
            <div className="input-group">
              <input
                className="form-control"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type your message…"
                style={{
                  borderRadius: 12,
                  border: "1px solid #E5E7EB",
                  padding: "12px 12px"
                }}
              />
              <button
                className="kpu-btn"
                onClick={send}
                disabled={busy}
                style={{
                  borderRadius: 12,
                  padding: "0 18px",
                  fontWeight: 600,
                  marginLeft: 8
                }}
              >
                Send
              </button>
            </div>

            <div className="text-muted mt-2" style={{ fontSize: 12 }}>
              Tip: Try “How do I contact IT support?” or “What are campus hours?”
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}