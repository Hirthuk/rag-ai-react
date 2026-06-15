import { useEffect, useRef, useState } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useChatStream } from "../hooks/useChatStream";

const API_BASE = "http://localhost:8080";

// ---------------------------------------------------------------------------
// Chart extraction fallback
// When the backend embeds JSON in the text answer instead of sending a proper
// event:chart frame, these functions try to pull out chart-compatible data.
// ---------------------------------------------------------------------------

const safeParseJson = (str) => {
  try { return JSON.parse(str); } catch { return null; }
};

const YEAR_RE = /^(FY)?\d{4}F?$/i;

// Recursively try to convert a parsed JSON value into [{year, value, type}]
const jsonToChartPoints = (json) => {
  // --- Array of objects with year + numeric value keys ---
  if (Array.isArray(json) && json.length) {
    const points = json.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const yearKey = Object.keys(item).find((k) => /year|fy|period/i.test(k));
      const valKey = Object.keys(item).find((k) =>
        /^(value|revenue|profit|sales|amount|income)$/i.test(k)
      );
      if (!yearKey || !valKey) return [];
      const value = Number(item[valKey]);
      if (isNaN(value)) return [];
      return [{ year: String(item[yearKey]), value, type: item.type ?? "historical" }];
    });
    if (points.length) return points;
  }

  if (!json || typeof json !== "object") return null;

  // --- Flat year-keyed numeric object: {"FY2024": 100, "FY2025": 120} ---
  const yearPairs = Object.entries(json).filter(
    ([k, v]) => YEAR_RE.test(k) && typeof v === "number"
  );
  if (yearPairs.length >= 2) {
    return yearPairs.map(([k, v]) => ({
      year: k,
      value: v,
      type: /F$/i.test(k) ? "forecast" : "historical",
    }));
  }

  // --- Nested: {"Revenue": {"FY2024": 22, "FY2025": 27}} ---
  for (const val of Object.values(json)) {
    if (val && typeof val === "object") {
      const nested = jsonToChartPoints(val);
      if (nested && nested.length >= 2) return nested;
    }
  }

  return null;
};

const tryExtractChartData = (text) => {
  // 1. Fenced code blocks (``` or ```json)
  const fenced = /```(?:json)?\s*([\s\S]*?)\s*```/g;
  let m;
  while ((m = fenced.exec(text)) !== null) {
    const json = safeParseJson(m[1]);
    if (json) {
      const data = jsonToChartPoints(json);
      if (data) return data;
    }
  }

  // 2. Bare JSON blocks embedded in the text — try the largest match first
  // (greedy match catches the whole top-level object/array)
  const bare = /(\{[\s\S]+\}|\[[\s\S]+\])/g;
  const candidates = [];
  while ((m = bare.exec(text)) !== null) candidates.push(m[1]);
  // Prefer longer candidates (more complete JSON)
  candidates.sort((a, b) => b.length - a.length);
  for (const candidate of candidates) {
    const json = safeParseJson(candidate);
    if (json) {
      const data = jsonToChartPoints(json);
      if (data) return data;
    }
  }

  return null;
};

// ---------------------------------------------------------------------------
// Count the number of cells in a markdown table row by splitting on |
const countTableCols = (line) =>
  line.split("|").filter((_, i, arr) => i > 0 && i < arr.length - 1).length;

// Ensure headings/lists have a blank line before them, and fix table separator
// rows whose column count doesn't match their header (common backend bug).
const normalizeMarkdown = (text) => {
  const normalized = text
    .replace(/\r\n/g, "\n")
    .replace(/([^\n])\n(#{1,6} )/g, "$1\n\n$2")
    .replace(/([^\n])\n([-*+] )/g, "$1\n\n$2");

  const lines = normalized.split("\n");
  const fixed = lines.map((line, i) => {
    // Detect a GFM table separator row (contains --- and only |, -, :, space)
    const isSeparator =
      line.includes("---") && /^\s*\|[\s\-:|]+\|\s*$/.test(line);
    if (!isSeparator || i === 0) return line;

    const prevLine = lines[i - 1];
    if (!prevLine?.trim().startsWith("|")) return line;

    const headerCols = countTableCols(prevLine);
    const sepCols = countTableCols(line);

    // Rebuild separator with the correct column count when they diverge
    if (headerCols > 0 && headerCols !== sepCols) {
      return "| " + Array(headerCols).fill("---").join(" | ") + " |";
    }
    return line;
  });

  return fixed.join("\n");
};

// Defined outside the component so the object reference is stable across renders
const mdComponents = {
  h1: ({ children }) => (
    <h1 className="text-base font-bold mt-4 mb-2 text-slate-900 border-b border-slate-200 pb-1">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-sm font-bold mt-4 mb-2 text-slate-900 border-b border-slate-100 pb-1">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-sm font-semibold mt-3 mb-1 text-slate-800">{children}</h3>
  ),
  p: ({ children }) => (
    <p className="mb-3 last:mb-0 leading-6 font-normal text-slate-800">{children}</p>
  ),
  ul: ({ children }) => (
    <ul className="list-disc pl-5 mb-3 space-y-1">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-decimal pl-5 mb-3 space-y-1">{children}</ol>
  ),
  li: ({ children }) => (
    <li className="leading-6 font-normal text-slate-800">{children}</li>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-slate-900">{children}</strong>
  ),
  em: ({ children }) => <em className="italic text-slate-700">{children}</em>,
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-sky-300 pl-3 italic text-slate-500 my-3">
      {children}
    </blockquote>
  ),
  code: ({ className, children }) => {
    const isBlock = /language-/.test(className || "");
    return isBlock ? (
      <code className="font-mono text-xs">{children}</code>
    ) : (
      <code className="bg-slate-200 text-slate-700 rounded px-1 py-0.5 text-xs font-mono">
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="bg-slate-100 rounded-lg p-3 overflow-x-auto text-xs font-mono mb-3">
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto mb-3">
      <table className="min-w-full text-xs border-collapse">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border border-slate-300 bg-slate-100 px-3 py-1.5 text-left font-semibold text-slate-700">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border border-slate-300 px-3 py-1.5 text-slate-700">{children}</td>
  ),
  hr: () => <hr className="border-slate-200 my-3" />,
};

export default function ChatPanel({ setChartData, setChartType, systemMessage }) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(
    localStorage.getItem("conversationId") || null,
  );
  const messagesEndRef = useRef(null);
  // Tracks whether the current stream received an event:chart frame so we
  // know whether to fall back to extracting chart data from the text.
  const hadChartEvent = useRef(false);

  const { streamingText, isStreaming, startStream, abort } = useChatStream();

  const isBusy = loading || isStreaming;

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  // Abort any in-flight stream when the component unmounts
  useEffect(() => {
    return () => abort();
  }, [abort]);

  const resolveConversationId = () => {
    const existing = localStorage.getItem("conversationId");
    if (existing) {
      if (!conversationId) setConversationId(existing);
      return existing;
    }
    const newId = crypto.randomUUID();
    localStorage.setItem("conversationId", newId);
    setConversationId(newId);
    return newId;
  };

  // Primary path: SSE streaming
  const sendStreamMessage = () => {
    if (!message.trim() || isBusy) return;
    abort();
    hadChartEvent.current = false;
    const convId = resolveConversationId();
    const text = message;
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setMessage("");

    startStream(
      {
        conversationId: convId,
        userMessage: text,
        systemMessage: systemMessage?.trim() || null,
      },
      {
        onChart: (data) => {
          hadChartEvent.current = true;
          setChartData(data);
          setChartType("line");
        },
        onDone: (fullText) => {
          setMessages((prev) => [...prev, { sender: "ai", text: fullText }]);

          // Fallback: if no event:chart arrived, try to extract chart data
          // from any JSON the backend embedded in the text answer.
          if (!hadChartEvent.current) {
            const extracted = tryExtractChartData(fullText);
            if (extracted) {
              setChartData(extracted);
              setChartType("line");
            }
          }
        },
        onError: (errMsg) => {
          setMessages((prev) => [
            ...prev,
            { sender: "ai", text: `Error: ${errMsg}` },
          ]);
        },
      },
    );
  };

  // Fallback: non-streaming POST /api/chat (kept as-is)
  const sendMessage = async () => {
    if (!message.trim() || isBusy) return;
    const convId = resolveConversationId();
    const text = message;
    setMessages((prev) => [...prev, { sender: "user", text }]);
    setLoading(true);
    setMessage("");

    try {
      const requestBody = { userMessage: text, conversationId: convId };
      if (systemMessage?.trim()) requestBody.systemMessage = systemMessage.trim();

      const response = await axios.post(`${API_BASE}/api/chat`, requestBody, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("Backend response:", response.data);
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: response.data.answer },
      ]);

      if (
        response.data.chartData &&
        Array.isArray(response.data.chartData) &&
        response.data.chartData.length > 0
      ) {
        setChartData(response.data.chartData);
        setChartType(response.data.chartType || "bar");
      } else {
        setChartData([]);
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      const errMsg =
        error.response?.data?.message || "Something went wrong. Please try again.";
      setMessages((prev) => [...prev, { sender: "ai", text: errMsg }]);
    } finally {
      setLoading(false);
    }
  };

  // Suppress unused-var warning — sendMessage is the kept fallback
  void sendMessage;

  return (
    <div className="flex h-full flex-col rounded-3xl border border-sky-100 bg-white/95 p-5 shadow-[0_24px_60px_-24px_rgba(14,165,233,0.18)]">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-600">
            Assistant
          </p>
          <h2 className="mt-2 text-lg font-semibold text-slate-900">
            Financial AI chat
          </h2>
        </div>
        <div className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-700">
          Live
        </div>
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white whitespace-pre-wrap"
                  : "border border-sky-100 bg-sky-50 text-slate-800"
              }`}
            >
              {msg.sender === "user" ? (
                msg.text
              ) : (
                <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                  {normalizeMarkdown(msg.text)}
                </ReactMarkdown>
              )}
            </div>
          </div>
        ))}

        {/* Live streaming bubble — shows token-by-token with blinking cursor */}
        {isStreaming && (
          <div className="flex justify-start">
            <div className="max-w-[85%] rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm leading-6 text-slate-800">
              <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
                {normalizeMarkdown(streamingText)}
              </ReactMarkdown>
              <span className="ml-0.5 inline-block h-[1em] w-0.5 animate-pulse bg-sky-500 align-middle" />
            </div>
          </div>
        )}

        {/* Non-streaming fallback loading indicator */}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-600">
              AI is thinking...
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="mt-4 flex gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Ask about company finances, growth trends, or just say hi..."
          className="flex-1 rounded-xl border border-sky-100 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !isBusy) sendStreamMessage();
          }}
        />
        <button
          onClick={sendStreamMessage}
          disabled={isBusy}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isBusy ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
