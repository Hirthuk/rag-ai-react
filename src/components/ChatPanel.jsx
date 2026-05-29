import { useEffect, useRef, useState } from "react";
import axios from "axios";

export default function ChatPanel({
  setChartData,
  setChartType,
  systemMessage,
}) {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(
    localStorage.getItem("conversationId") || null,
  );
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!conversationId) {
      const newConversationId = crypto.randomUUID();
      localStorage.setItem("conversationId", newConversationId);
      setConversationId(newConversationId);
    }
    if (!message.trim()) return;

    const userMessage = {
      sender: "user",
      text: message,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      const requestBody = {
        userMessage: message,
        conversationId:
          localStorage.getItem("conversationId") || crypto.randomUUID(),
      };

      if (systemMessage?.trim()) {
        requestBody.systemMessage = systemMessage.trim();
      }

      const response = await axios.post(
        "http://localhost:8080/api/chat",
        requestBody,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      console.log("Backend response:", response.data);

      const aiMessage = {
        sender: "ai",
        text: response.data.answer,
      };

      setMessages((prev) => [...prev, aiMessage]);

      // Handle chart data - simplified
      if (
        response.data.chartData &&
        Array.isArray(response.data.chartData) &&
        response.data.chartData.length > 0
      ) {
        // Ensure data has the correct format
        let chartDataToSet = response.data.chartData;

        // If data has 'profit' or 'revenue' instead of 'value', transform it
        if (chartDataToSet[0] && !chartDataToSet[0].hasOwnProperty("value")) {
          const firstKey = Object.keys(chartDataToSet[0]).find(
            (key) => key !== "year",
          );
          if (firstKey) {
            chartDataToSet = chartDataToSet.map((item) => ({
              year: item.year,
              value: item[firstKey],
            }));
            console.log(
              "Transformed data to use 'value' field:",
              chartDataToSet,
            );
          }
        }

        setChartData(chartDataToSet);
        setChartType(response.data.chartType || "bar");
        console.log("Chart updated with data:", chartDataToSet);
      } else {
        // Clear chart if no data
        setChartData([]);
      }
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);

      const errorMessage =
        error.response?.data?.message ||
        "Something went wrong. Please try again.";

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: errorMessage,
        },
      ]);
    }

    setLoading(false);
    setMessage("");
  };

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
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-wrap ${
                msg.sender === "user"
                  ? "bg-gradient-to-r from-sky-500 to-cyan-500 text-white"
                  : "border border-sky-100 bg-sky-50 text-slate-800"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

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
            if (e.key === "Enter" && !loading) {
              sendMessage();
            }
          }}
        />

        <button
          onClick={sendMessage}
          disabled={loading}
          className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Sending..." : "Send"}
        </button>
      </div>
    </div>
  );
}
