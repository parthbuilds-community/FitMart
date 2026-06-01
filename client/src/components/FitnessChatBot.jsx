import { useState, useEffect, useRef } from "react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

const WELCOME = {
  role: "bot",
  text:
    "Hello! I'm your FitMart fitness assistant. Ask me anything about workouts, diet, protein, weight loss, or muscle gain.",
};

const QUICK_REPLIES = [
  { label: "💪 Build muscle", prompt: "How can I build muscle effectively?" },
  { label: "🥗 Diet plan", prompt: "What's a good daily diet plan?" },
  { label: "🏃 Cardio tips", prompt: "Give me tips for cardio workouts" },
  { label: "⚖️ Lose weight", prompt: "How do I lose weight sustainably?" },
];

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

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [open]);

  const send = async (customText = input) => {
    const text =
      typeof customText === "string" ? customText.trim() : "";

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

      const data = await res.json().catch(() => ({}));

      // Handle backend-controlled failure (NEW IMPROVEMENT)
      if (!res.ok || data?.errorCode === "GEMINI_UNAVAILABLE") {
        setMsgs((prev) => [
          ...prev,
          {
            role: "bot",
            error: true,
            text:
              "Our AI trainer is currently resting 💤 Please try again in a few moments.",
          },
        ]);
        return;
      }

      setMsgs((prev) => [
        ...prev,
        { role: "bot", text: data.reply || "No response received." },
      ]);
    } catch (err) {
      setMsgs((prev) => [
        ...prev,
        {
          role: "bot",
          error: true,
          text:
            "Network issue detected. Please check your connection and try again.",
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
      const boldRegex = /\*\*(.*?)\*\*|__(.*?)__/g;
      const parts = [];
      let lastIndex = 0;
      let match;

      while ((match = boldRegex.exec(line)) !== null) {
        if (match.index > lastIndex) {
          parts.push(
            <span key={`t-${lineIndex}-${lastIndex}`}>
              {line.slice(lastIndex, match.index)}
            </span>
          );
        }

        parts.push(
          <strong
            key={`b-${lineIndex}-${match.index}`}
            className="font-semibold text-stone-900"
          >
            {match[1] || match[2]}
          </strong>
        );

        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < line.length) {
        parts.push(
          <span key={`e-${lineIndex}`}>{line.slice(lastIndex)}</span>
        );
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
      {/* UI unchanged for brevity — keep your existing JSX */}
      {/* Only logic improved above */}
    </>
  );
}
