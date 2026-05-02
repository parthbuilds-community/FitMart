// src/components/FitnessChatBot.jsx
import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const WELCOME = {
  role: "bot",
  text: "Hello! I'm your FitMart fitness assistant. Ask me anything about workouts, diet, protein, weight loss, or muscle gain.",
};

export default function FitnessChatBot() {
  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState([WELCOME]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [visible, setVisible] = useState(false);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

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

  const send = async () => {
    const text = input.trim();
    if (!text || typing) return;
    setMsgs((prev) => [...prev, { role: "user", text }]);
    setInput("");
    setTyping(true);
    try {
      const res = await fetch(`${API}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });
      if (!res.ok) throw new Error("Request failed");
      const data = await res.json();
      setMsgs((prev) => [...prev, { role: "bot", text: data.reply }]);
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

  const formatMessageText = (text) => {
    const lines = text.split("\n");
    return lines.map((line, lineIndex) => {
      const parts = [];
      const boldRegex = /\*\*(.*?)\*\*|__(.*?)__/g;
      const matches = [];
      let matchFound;
      while ((matchFound = boldRegex.exec(line)) !== null) {
        matches.push({
          start: matchFound.index,
          end: matchFound.index + matchFound[0].length,
          text: matchFound[1] || matchFound[2],
        });
      }
      if (matches.length === 0) {
        parts.push(<span key={`line-${lineIndex}`}>{line}</span>);
      } else {
        let currentPos = 0;
        matches.forEach((match, idx) => {
          if (match.start > currentPos) {
            parts.push(
              <span key={`text-${lineIndex}-${idx}`}>
                {line.substring(currentPos, match.start)}
              </span>
            );
          }
          parts.push(
            <strong key={`bold-${lineIndex}-${idx}`}
              className="font-semibold text-stone-900">
              {match.text}
            </strong>
          );
          currentPos = match.end;
        });
        if (currentPos < line.length) {
          parts.push(
            <span key={`text-${lineIndex}-end`}>
              {line.substring(currentPos)}
            </span>
          );
        }
      }
      return (
        <span key={lineIndex}>
          {parts}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      );
    });
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
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="flex items-center gap-1.5 text-[10px] text-stone-400">
              <span className="w-1.5 h-1.5 rounded-full bg-stone-400 animate-pulse" />
              Online
            </span>
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
                {formatMessageText(msg.text)}
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

        {/* ── Input Area ── */}
        <div className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white flex items-end gap-2 shrink-0">
          <textarea
            ref={inputRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask about workouts, diet, protein…"
            disabled={typing}
            className="flex-1 resize-none border border-stone-200 bg-stone-50 rounded-xl
                       px-3.5 sm:px-4 py-2.5 text-sm text-stone-900 placeholder-stone-300
                       focus:outline-none focus:border-stone-900 transition-colors
                       disabled:opacity-50 leading-relaxed"
            style={{ maxHeight: "96px", overflowY: "auto" }}
            onInput={(e) => {
              e.target.style.height = "auto";
              e.target.style.height = Math.min(e.target.scrollHeight, 96) + "px";
            }}
          />
          <button
            onClick={send}
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