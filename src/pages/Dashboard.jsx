import { useState } from "react";

import ChatPanel from "../components/ChatPanel";
import FinancialChart from "../charts/FinancialChart";
import FileUpload from "../components/FileUpload";

export default function Dashboard() {
  const [chartData, setChartData] = useState([]);
  const [chartType, setChartType] = useState("line");
  const [systemMessage, setSystemMessage] = useState("");
  const [systemDraft, setSystemDraft] = useState("");
  const [showSystemInput, setShowSystemInput] = useState(false);

  const handleToggleSystemInput = () => {
    if (!showSystemInput) {
      setSystemDraft(systemMessage);
    }
    setShowSystemInput((prev) => !prev);
  };

  const saveSystemMessage = () => {
    setSystemMessage(systemDraft.trim());
    setShowSystemInput(false);
  };

  return (
    <div className="min-h-screen text-slate-900">
      <div className="mx-auto max-w-360 px-4 py-6 sm:px-6 lg:px-8">
        <header className="rounded-[28px] border border-white/70 bg-white/80 px-6 py-5 shadow-[0_24px_60px_-24px_rgba(14,165,233,0.22)] backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-sky-600">
                FinSight AI
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">
                Financial RAG based AI
              </h1>
            </div>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-sky-100 bg-sky-50 px-3 py-1 font-medium text-sky-700">
                Enterprise-ready
              </span>
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 font-medium text-slate-600">
                Live analysis
              </span>
            </div>
          </div>
        </header>

        <main className="mt-6 grid gap-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <FileUpload />
            <div className="rounded-3xl border border-sky-100 bg-white/90 p-5 shadow-[0_24px_60px_-24px_rgba(14,165,233,0.18)] backdrop-blur-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    System message
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Optional prompt for the AI context.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleToggleSystemInput}
                  className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  {showSystemInput ? "Close" : systemMessage ? "Edit" : "Add"}
                </button>
              </div>

              {showSystemInput ? (
                <div className="mt-4 space-y-3">
                  <textarea
                    value={systemDraft}
                    onChange={(e) => setSystemDraft(e.target.value)}
                    placeholder="Enter an optional system prompt"
                    className="w-full rounded-2xl border border-sky-100 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white"
                    rows={4}
                  />
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowSystemInput(false);
                        setSystemDraft(systemMessage);
                      }}
                      className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={saveSystemMessage}
                      className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <p className="mt-4 min-h-18 text-sm text-slate-600">
                  {systemMessage || "No system message configured."}
                </p>
              )}
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-[2fr_1fr] xl:items-start">
            {/* Chat Panel Section */}
            <div className="rounded-3xl border border-sky-100 bg-white/90 p-5 shadow-[0_24px_60px_-24px_rgba(14,165,233,0.18)] backdrop-blur-sm h-155 xl:h-[calc(100vh-220px)]">
              <ChatPanel
                setChartData={setChartData}
                setChartType={setChartType}
                systemMessage={systemMessage}
              />
            </div>

            {/* Chart Section */}
            <div
              className="rounded-3xl border border-sky-100 bg-white/90 p-5 shadow-[0_24px_60px_-24px_rgba(14,165,233,0.18)] backdrop-blur-sm"
              style={{
                height: "500px",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-4 flex-shrink-0">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-600">
                    Insights
                  </p>
                  <h2 className="mt-2 text-xl font-semibold text-slate-900">
                    Financial performance overview
                  </h2>
                </div>
                <div className="rounded-full bg-slate-50 px-3 py-1 text-sm text-slate-600">
                  {chartType === "bar"
                    ? "Bar chart"
                    : chartType === "line"
                      ? "Line chart"
                      : "No chart"}
                </div>
              </div>
              <div style={{ flex: 1, minHeight: 0, width: "100%" }}>
                <FinancialChart chartData={chartData} chartType={chartType} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
