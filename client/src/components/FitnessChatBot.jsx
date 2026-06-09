// src/components/FitnessChatBot.jsx
import { useState, useEffect, useRef } from "react";
import { marked } from "marked";
import DOMPurify from "dompurify";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const WELCOME = {
  role: "bot",
  text: "Hello! I'm your FitMart fitness assistant. Ask me anything about workouts, diet, protein, weight loss, or muscle gain.",
};

// Maximum number of history entries (messages) to send to the server.
// Matches the server-side MAX_HISTORY_TURNS cap.
const MAX_HISTORY = 6;
// Configure marked options once
marked.setOptions({
  breaks: true,   // convert \n to <br>
  gfm: true,      // GitHub-flavored markdown
});


const QUICK_REPLIES = [
  {
    label: "💪 Build muscle",
    prompt: "How can I build muscle effectively?",
  },
  {
    label: "🥗 Diet plan",
    prompt: "What's a good daily diet plan?",
  },
  {
    label: "🏃 Cardio tips",
    prompt: "Give me tips for cardio workouts",
  },
  {
    label: "⚖️ Lose weight",
    prompt: "How do I lose weight sustainably?",
  },
];

export default function FitnessChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [visible, setVisible] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const historyRef = useRef([]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs, typing]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 200);
  }, [open]);

  // Prevent body scroll on mobile when chat is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  /** Resets the chat to its initial state and wipes conversation history. */
  const clearChat = () => {
    setMsgs([WELCOME]);
    setInput("");
    historyRef.current = [];
  };

  const send = async (customText = input) => {
    // customText is passed from quick replies,
    // otherwise fallback to manual textarea input.
    // Prevent crashes if non-string values are passed into send
    const text =
      typeof customText === "string"
        ? customText.trim()
        : "";

    if (!text || typing) return;
    setMsgs((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setTyping(true);

    // Snapshot and cap history before the fetch so the ref can't mutate mid-flight.
    const historySnapshot = historyRef.current.slice(-MAX_HISTORY);

    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: historySnapshot }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      const botText = data.reply;

      setMsgs((prev) => [...prev, { role: "bot", text: botText }]);

      // Append both turns to history after a successful round-trip.
      historyRef.current = [
        ...historyRef.current,
        { role: "user", parts: [{ text }] },
        { role: "assistant", parts: [{ text: botText }] },
      ];
    } catch {
      setMsgs((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Sorry, I couldn't connect right now. Please try again.",
          error: true,
        },
      ]);
    } finally {
      setTyping(false);
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  // Renders bot messages as sanitized HTML markdown, user messages as plain text
  const formatMessageText = (text, isBot = false) => {
    if (!isBot) return <span>{text}</span>;
    try {
      const rawHtml = marked.parse(text);
      const cleanHtml = DOMPurify.sanitize(rawHtml, {
        ALLOWED_TAGS: [
          "strong", "em", "ul", "ol", "li", "p", "br",
          "code", "pre", "blockquote", "h1", "h2", "h3",
        ],
        ALLOWED_ATTR: ["class"],
      });
      return (
        <div
          className="fm-bot-content"
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />
      );
    } catch {
      // Fallback to plain text if markdown parsing fails
      return <span>{text}</span>;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=DM+Serif+Display&display=swap');
        .fm-chat-window {
          transform-origin: bottom right;
          transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .fm-chat-window.closed {
          opacity: 0;
          transform: scale(0.92) translateY(12px);
          pointer-events: none;
        }
        .fm-chat-window.open {
          opacity: 1;
          transform: scale(1) translateY(0);
          pointer-events: auto;
        }
        .fm-fab {
          transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s ease;
        }
        .fm-fab:hover { transform: scale(1.06); }
        .fm-fab:active { transform: scale(0.96); }
        .fm-msg {
          animation: fmMsgIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes fmMsgIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fm-dot { animation: fmDot 1.2s infinite; }
        .fm-dot:nth-child(2) { animation-delay: 0.2s; }
        .fm-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes fmDot {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40%            { transform: translateY(-4px); opacity: 1; }
        }
        .fm-scrollbar::-webkit-scrollbar { width: 4px; }
        .fm-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .fm-scrollbar::-webkit-scrollbar-thumb { background: #e7e5e3; border-radius: 99px; }
        .fm-clear-btn {
          transition: color 0.15s ease, background 0.15s ease;
        }
        .fm-clear-btn:hover { color: #ef4444; background: rgba(239,68,68,0.1); }

        /* ── Markdown styles scoped to bot messages only ── */
        .fm-bot-content ul { list-style-type: disc; margin: 0.5rem 0 0.5rem 1.25rem; padding-left: 0; }
        .fm-bot-content ol { list-style-type: decimal; margin: 0.5rem 0 0.5rem 1.25rem; padding-left: 0; }
        .fm-bot-content li { margin-bottom: 0.25rem; }
        .fm-bot-content p  { margin: 0.25rem 0; }
        .fm-bot-content p:first-child { margin-top: 0; }
        .fm-bot-content p:last-child  { margin-bottom: 0; }
        .fm-bot-content strong { font-weight: 600; color: #1c1917; }
        .fm-bot-content em { font-style: italic; }
        .fm-bot-content code {
          background: #f5f5f4;
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: monospace;
          font-size: 0.875em;
        }
        .fm-bot-content pre {
          background: #f5f5f4;
          padding: 0.75rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 0.5rem 0;
        }
        .fm-bot-content pre code {
          background: none;
          padding: 0;
          font-size: 0.8em;
        }
        .fm-bot-content blockquote {
          border-left: 3px solid #d6d3d1;
          padding-left: 0.75rem;
          margin: 0.5rem 0;
          color: #78716c;
          font-style: italic;
        }
        .fm-bot-content h1,
        .fm-bot-content h2,
        .fm-bot-content h3 {
          font-weight: 600;
          color: #1c1917;
          margin: 0.5rem 0 0.25rem;
        }
      `}</style>

      {/* ── Chat Window ── */}
      {/* Full-screen on mobile, fixed-size floating window on sm+ */}
      <div
        className={`fm-chat-window fixed z-50 bg-white border border-stone-200
                    shadow-2xl flex flex-col overflow-hidden
                    /* Mobile: full screen minus FAB area */
                    bottom-20 right-3 left-3 rounded-2xl
                    /* sm+: floating panel anchored to bottom-right */
                    sm:bottom-24 sm:right-5 sm:left-auto sm:w-90
                    ${open ? "open" : "closed"}`}
        style={{
          fontFamily: "'DM Sans', sans-serif",
          /* Mobile height fills available space; fixed on sm+ */
          height: "calc(100vh - 6rem)",
          maxHeight: "520px",
        }}
      >
        {/* ── Header ── */}
        <div className="bg-stone-900 px-4 sm:px-5 py-3.5 sm:py-4 flex items-center
                        justify-between shrink-0">
          <div>
            <p className="text-xs tracking-[0.2em] uppercase text-stone-400 mb-0.5">
              FitMart
            </p>
            <h3
              style={{ fontFamily: "'DM Serif Display', serif" }}
              className="text-white text-base sm:text-lg leading-tight"
            >
              Fitness Assistant
            </h3>
          </div>
          <div className="flex items-center gap-1 sm:gap-2">
            <span className="flex items-center gap-1.5 text-[10px] text-stone-400 mr-1">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-pulse" />
              Online
            </span>
            {msgs.length > 1 && (
              <button
                onClick={clearChat}
                className="fm-clear-btn text-stone-400 text-[10px] tracking-wide uppercase
                           min-w-8 min-h-8 flex items-center justify-center
                           rounded-full px-2 gap-1"
                aria-label="Clear chat history"
                title="Clear conversation"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18" />
                  <path d="M8 6V4h8v2" />
                  <path d="M19 6l-1 14H6L5 6" />
                </svg>
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}

            <button
              onClick={() => setOpen(false)}
              className="text-stone-400 hover:text-white transition-colors text-2xl
                         leading-none min-w-9 min-h-9 flex items-center
                         justify-center rounded-full hover:bg-white/10"
              aria-label="Close chat"
            >
              ×
            </button>
          </div>
        </div>

        {/* ── Messages Area ── */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-5 space-y-3
                        fm-scrollbar bg-stone-50">
          {msgs.map((msg, idx) => (
            <div
              key={idx}
              className={`fm-msg flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              {msg.role === "bot" && (
                <div className="w-7 h-7 rounded-full bg-stone-900 flex items-center
                                justify-center text-white text-xs shrink-0 mr-2 mt-0.5">
                  ◎
                </div>
              )}
              <div
                className={`max-w-[80%] sm:max-w-[78%] px-3.5 sm:px-4 py-2.5 sm:py-3
                            rounded-2xl text-sm leading-relaxed
                            ${msg.role === "user"
                    ? "bg-stone-900 text-white rounded-br-sm"
                    : msg.error
                      ? "bg-red-50 border border-red-100 text-red-600 rounded-bl-sm"
                      : "bg-white border border-stone-200 text-stone-700 rounded-bl-sm shadow-sm"
                  }`}
              >
                {formatMessageText(msg.text, msg.role === "bot")}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {typing && (
            <div className="fm-msg flex justify-start">
              <div className="w-7 h-7 rounded-full bg-stone-900 flex items-center
                              justify-center text-white text-xs shrink-0 mr-2 mt-0.5">
                ◎
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl rounded-bl-sm
                              px-4 py-3 flex items-center gap-1.5 shadow-sm">
                <span className="fm-dot w-1.5 h-1.5 rounded-full bg-stone-400 inline-block" />
                <span className="fm-dot w-1.5 h-1.5 rounded-full bg-stone-400 inline-block" />
                <span className="fm-dot w-1.5 h-1.5 rounded-full bg-stone-400 inline-block" />
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="h-px bg-stone-100 shrink-0" />

        {/* Show quick replies only before the conversation starts
            to keep the chat area clean after interaction begins */}
        {msgs.length === 1 && (
          <div className="flex gap-2 overflow-x-auto whitespace-nowrap pb-1 scrollbar-hide">
            {QUICK_REPLIES.map((reply) => (
              <button
                key={reply.label}
                onClick={() => send(reply.prompt)}
                className="px-3 py-1.5 text-sm bg-white border border-stone-200 rounded-full shadow-sm hover:bg-stone-100 transition-colors shrink-0"
              >
                {reply.label}
              </button>
            ))}
          </div>
        )}

        {/* ── Input Area ── */}
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white flex items-end gap-2 shrink-0 overflow-hidden">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about workouts, diet, protein…"
            disabled={typing}
            className="flex-1 min-w-0  resize-none border border-stone-200 bg-stone-50 rounded-xl
                       px-3.5 sm:px-4 py-2.5 text-sm text-stone-900 placeholder-stone-300
                       focus:outline-none focus:border-stone-900 transition-colors
                       disabled:opacity-50 leading-relaxed"
            // min-w-0 allows the textarea to shrink correctly
            // inside flex layouts and prevents layout overflow
            style={{ maxHeight: "96px", overflowY: "hidden" }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
            }}
          />
          <button
            // Wrap send() in an arrow function to avoid
            // React automatically passing the click event object
            onClick={() => send()}
            disabled={!input.trim() || typing}
            className="w-10 h-10 sm:w-9 sm:h-9 bg-stone-900 text-white rounded-full
                       flex items-center justify-center hover:bg-stone-700 transition-colors
                       disabled:opacity-30 disabled:cursor-not-allowed shrink-0
                       active:scale-95 min-w-10"
            aria-label="Send message"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
              strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

      {/* ── FAB ── */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`fm-fab fixed bottom-5 right-5 z-50 w-14 h-14 bg-stone-900 text-white
                    rounded-full shadow-lg flex items-center justify-center
                    transition-opacity duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
        aria-label="Toggle fitness assistant"
      >
        {open ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round"
            strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        )}
      </button>
    </>
  );
}