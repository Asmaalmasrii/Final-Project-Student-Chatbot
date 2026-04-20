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
    <div style={{ background: "#F0E7D8" }}>
      <div className="container-fluid p-0">
        <div style={{ display: "flex", flexDirection: "column", position: "relative", width: "100%" }}>

          {/* Scrollable Chat Body */}
          <div
            ref={chatRef}
            style={{
              height: 625, //625 | 775
              overflowY: "auto",
              background: "transparent",
              marginBottom: "10px",
              width: "100%"
            }}
          >
            <div style={{ maxWidth: 1000, margin: "0 auto", padding: "0 15px" }}>
              {messages.map((msg, i) => {
                const isUser = msg.from === "user";
                return (
                  <div
                    key={i}
                    className={`d-flex fade-in ${isUser ? "justify-content-end" : "justify-content-start"
                      }`}
                    style={{ marginBottom: "10px" }}
                  >
                    <div
                      className="px-3 py-2"
                      style={{
                        maxWidth: "75%",
                        borderRadius: isUser
                          ? "16px 0 16px 16px"
                          : "0 16px 16px 16px",
                        background: isUser ? "#371C23" : "#800022",
                        color: "#F4EDE2",
                        border: "none",
                        boxShadow: "none",
                        whiteSpace: "pre-wrap",
                        lineHeight: 1.45,
                        fontSize: 16
                      }}
                    >
                      <div>{msg.text}</div>
                    </div>
                  </div>
                );
              })}

              {busy && (
                <div
                  className="d-flex justify-content-start fade-in"
                  style={{ marginBottom: "10px" }}
                >
                  <div
                    className="px-3 py-2"
                    style={{
                      maxWidth: "75%",
                      borderRadius: "0 16px 16px 16px",
                      background: "#800022",
                      color: "#F4EDE2",
                      border: "none",
                      boxShadow: "none",
                      fontSize: 15
                    }}
                  >
                    <TypingDots />
                  </div>
                </div>
              )}

              {/* anchor */}
              <div ref={bottomRef} />
            </div>
          </div>

          {/* Input Area */}
          <div style={{ maxWidth: 1000, margin: "0 auto", width: "100%", padding: "0 15px", marginBottom: "20px", position: "relative" }}>

            {/* Floating Back To Top */}
            {showTopBtn && (
              <button
                onClick={scrollToTop}
                style={{
                  position: "absolute",
                  right: -50,
                  bottom: 12,
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  padding: 0,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 20,
                  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                  zIndex: 10,
                  background: "#F4EDE2",
                  border: "1px solid #800022",
                  color: "#800022"
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
                style={{
                  position: "absolute",
                  right: -50,
                  bottom: 12,
                  width: 38,
                  height: 38,
                  borderRadius: "50%",
                  padding: 0,
                  display: "grid",
                  placeItems: "center",
                  fontSize: 20,
                  boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
                  zIndex: 10,
                  background: "#F4EDE2",
                  border: "1px solid #800022",
                  color: "#800022"
                }}
                title="Jump to latest"
              >
                ↓
              </button>
            )}

            <div
              style={{
                background: "#800022",
                borderRadius: "30px",
                display: "flex",
                alignItems: "center",
                padding: "10px 24px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
              }}
            >
              <input
                className="chat-input-custom"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Ask Anything"
                style={{
                  flex: 1,
                  background: "transparent",
                  border: "none",
                  color: "#F4EDE2",
                  outline: "none",
                  fontSize: "16px"
                }}
              />
              <button
                onClick={send}
                disabled={busy}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#F4EDE2",
                  fontWeight: "bold",
                  fontSize: "16px",
                  marginLeft: "8px"
                }}
              >
                SEND
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}