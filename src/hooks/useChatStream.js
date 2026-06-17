import { useCallback, useRef, useState } from "react";

import { API_BASE } from "../services/api";

export function useChatStream() {
  const [streamingText, setStreamingText] = useState("");
  const [chartData, setChartData] = useState(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  const abort = useCallback(() => {
    abortControllerRef.current?.abort();
  }, []);

  const startStream = useCallback(async (
    { conversationId, userMessage, systemMessage = null },
    callbacks = {}
  ) => {
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setStreamingText("");
    setChartData(null);
    setError(null);
    setIsStreaming(true);

    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(`${API_BASE}/api/chat/stream`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "text/event-stream",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ conversationId, userMessage, systemMessage }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let fullText = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Split on double newline (SSE frame boundary), keep trailing partial in buffer
        const frames = buffer.split("\n\n");
        buffer = frames.pop() ?? "";

        for (const frame of frames) {
          if (!frame.trim()) continue;

          let eventType = null;
          let dataValue = null;

          for (const line of frame.split("\n")) {
            // Strip \r so both \n and \r\n line endings work
            const l = line.replace(/\r$/, "");
            if (l.startsWith("event:")) {
              eventType = l.slice("event:".length).trim();
            } else if (l.startsWith("data:")) {
              // Per SSE spec: multiple data: lines are joined with \n — do NOT overwrite
              const val = l.slice("data:".length);
              dataValue = dataValue === null ? val : dataValue + "\n" + val;
            }
          }

          if (eventType === "token" && dataValue !== null) {
            fullText += dataValue;
            setStreamingText(fullText);
          } else if (eventType === "chart" && dataValue !== null) {
            try {
              const parsed = JSON.parse(dataValue);
              setChartData(parsed);
              callbacks.onChart?.(parsed);
            } catch {
              // ignore malformed chart JSON
            }
          } else if (eventType === "done") {
            setIsStreaming(false);
            callbacks.onDone?.(fullText);
            return;
          } else if (eventType === "error" && dataValue !== null) {
            setError(dataValue);
            setIsStreaming(false);
            callbacks.onError?.(dataValue);
            return;
          }
        }
      }
    } catch (err) {
      if (err.name === "AbortError") return;
      const msg = err.message ?? "Stream failed";
      setError(msg);
      callbacks.onError?.(msg);
    } finally {
      setIsStreaming(false);
    }
  }, []);

  return { streamingText, chartData, isStreaming, error, startStream, abort };
}
