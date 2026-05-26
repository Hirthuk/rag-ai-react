import { useEffect, useRef, useState } from "react"
import axios from "axios"

export default function ChatPanel({ setChartData, setChartType }) {

    const [message, setMessage] = useState("")
    const [messages, setMessages] = useState([])
    const [loading, setLoading] = useState(false)

    const messagesEndRef = useRef(null)

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({
            behavior: "smooth"
        })
    }

    const sendMessage = async () => {

        if (!message.trim()) return

        const userMessage = {
            sender: "user",
            text: message
        }

        setMessages(prev => [...prev, userMessage])

        setLoading(true)

        try {

            const response = await axios.get(
                "http://localhost:8080/api/chat",
                {
                    params: {
                        message: message
                    }
                }
            )

            const aiMessage = {
                sender: "ai",
                text: response.data.answer
            }

            setMessages(prev => [...prev, aiMessage])

            setChartData(response.data.chartData)
            setChartType(response.data.chartType)

        } catch (error) {

            console.error(error)

            setMessages(prev => [
                ...prev,
                {
                    sender: "ai",
                    text: "Something went wrong."
                }
            ])
        }

        setLoading(false)
        setMessage("")
    }

    return (
        <div className="flex h-full flex-col rounded-[24px] border border-sky-100 bg-white/95 p-5 shadow-[0_24px_60px_-24px_rgba(14,165,233,0.18)]">
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
                            msg.sender === "user"
                                ? "justify-end"
                                : "justify-start"
                        }`}
                    >
                        <div
                            className={`max-w-[85%] rounded-[20px] px-4 py-3 text-sm leading-6 ${
                                msg.sender === "user"
                                    ? "bg-linear-to-r from-sky-500 to-cyan-500 text-white"
                                    : "border border-sky-100 bg-sky-50 text-slate-800"
                            }`}
                        >
                            {msg.text}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="rounded-[20px] border border-sky-100 bg-sky-50 px-4 py-3 text-sm text-slate-600">
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
                    placeholder="Ask financial questions..."
                    className="flex-1 rounded-xl border border-sky-100 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-sky-300 focus:bg-white"
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            sendMessage()
                        }
                    }}
                />

                <button
                    onClick={sendMessage}
                    className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                    Send
                </button>
            </div>
        </div>
    )
}