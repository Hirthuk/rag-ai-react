import { useState } from "react"

import ChatPanel from "../components/ChatPanel"
import FinancialChart from "../charts/FinancialChart"
import FileUpload from "../components/FileUpload"

export default function Dashboard() {

    const [chartData, setChartData] = useState([])
    const [chartType, setChartType] = useState("line")

    return (
        <div className="min-h-screen text-slate-900">
            <div className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
                <header className="rounded-[28px] border border-white/70 bg-white/80 px-6 py-5 shadow-[0_24px_60px_-24px_rgba(14,165,233,0.22)] backdrop-blur-sm">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-sky-600">
                                FinSight AI
                            </p>
                            <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">
                                Financial RAG Forecast Assistant
                            </h1>
                            <p className="mt-2 max-w-2xl text-sm text-slate-600 sm:text-base">
                                Review business insights, upload relevant documents, and discuss performance trends in one streamlined workspace.
                            </p>
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

                <main className="mt-6 grid gap-6 xl:grid-cols-12">
                    <section className="xl:col-span-4">
                        <div className="grid gap-6">
                            <FileUpload />
                            <div className="rounded-[24px] border border-sky-100 bg-white/90 p-5 shadow-[0_24px_60px_-24px_rgba(14,165,233,0.18)] backdrop-blur-sm">
                                <ChatPanel
                                    setChartData={setChartData}
                                    setChartType={setChartType}
                                />
                            </div>
                        </div>
                    </section>

                    <section className="xl:col-span-8">
                        <div className="rounded-[28px] border border-sky-100 bg-white/90 p-5 shadow-[0_24px_60px_-24px_rgba(14,165,233,0.18)] backdrop-blur-sm">
                            <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                                <div>
                                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-600">
                                        Insights
                                    </p>
                                    <h2 className="mt-2 text-xl font-semibold text-slate-900">
                                        Financial performance overview
                                    </h2>
                                </div>
                                <div className="rounded-full bg-slate-50 px-3 py-1 text-sm text-slate-600">
                                    {chartType === "bar" ? "Bar chart" : "Line chart"}
                                </div>
                            </div>
                            <div className="min-h-[520px]">
                                <FinancialChart
                                    chartData={chartData}
                                    chartType={chartType}
                                />
                            </div>
                        </div>
                    </section>
                </main>
            </div>
        </div>
    )
}