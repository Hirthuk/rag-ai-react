import { useState, useRef } from "react";
import axios from "axios";

export default function FileUpload() {
    const [status, setStatus] = useState("");
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const fileInputRef = useRef(null);

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    const handleFileSelect = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            setStatus("❌ File too large. Maximum size is 10MB.");
            return;
        }

        setSelectedFile(file);

        if (file.type.startsWith("image/")) {
            const previewUrl = URL.createObjectURL(file);
            setImagePreview(previewUrl);
        } else {
            setImagePreview(null);
        }

        const formData = new FormData();
        formData.append("file", file);
        setUploading(true);
        setStatus(`Uploading ${file.name}...`);

        try {
            await axios.post("http://localhost:8080/api/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data"
                }
            });

            setStatus("✅ File uploaded and processed successfully.");

            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }

            setTimeout(() => {
                if (imagePreview) {
                    URL.revokeObjectURL(imagePreview);
                }
                setSelectedFile(null);
                setImagePreview(null);
                setStatus("");
            }, 3000);
        } catch (error) {
            console.error(error);
            setStatus("❌ Upload failed: " + (error.response?.data?.message || error.message));
        } finally {
            setUploading(false);
        }
    };

    // Helper function to get file icon based on type
    const getFileIcon = (fileName, fileType) => {
        if (fileType?.startsWith("image/")) return "🖼️";
        if (fileName?.endsWith(".pdf")) return "📄";
        if (fileName?.endsWith(".txt")) return "📃";
        if (fileName?.endsWith(".html") || fileName?.endsWith(".htm")) return "🌐";
        return "📎";
    };

    const statusTone =
        status.includes("✅")
            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
            : status.includes("❌")
                ? "border-rose-200 bg-rose-50 text-rose-700"
                : "border-sky-200 bg-sky-50 text-sky-700";

    // List of supported file types for display
    const supportedFormats = [
        "PDF", "TXT",
        "JPG", "PNG", "WEBP",
        "HTML"
    ];

    return (
        <section className="rounded-[24px] border border-sky-100 bg-white/95 p-5 shadow-[0_24px_60px_-24px_rgba(14,165,233,0.22)] backdrop-blur-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-sky-600">
                        Upload
                    </p>
                    <h2 className="mt-2 text-lg font-semibold text-slate-900">
                        Document or image intake
                    </h2>
                    <p className="mt-2 text-sm text-slate-600">
                        Select a file and let the assistant process it in a single step.
                    </p>
                </div>
                <div className="rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold text-sky-700">
                    Fast • Secure
                </div>
            </div>

            <div className="mt-4 grid gap-4">
                {imagePreview && (
                    <div className="overflow-hidden rounded-2xl border border-sky-100 bg-sky-50/70 p-2">
                        <img
                            src={imagePreview}
                            alt="Selected preview"
                            className="h-40 w-full rounded-xl object-cover"
                        />
                    </div>
                )}

                {selectedFile && !uploading && (
                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">
                                {getFileIcon(selectedFile.name, selectedFile.type)}
                            </span>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-slate-900">{selectedFile.name}</p>
                                <div className="mt-2 flex flex-wrap gap-3 text-sm text-slate-600">
                                    <span>{(selectedFile.size / 1024).toFixed(2)} KB</span>
                                    <span>{selectedFile.type || "Unknown type"}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={triggerFileSelect}
                    disabled={uploading}
                    className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                        uploading
                            ? "cursor-not-allowed bg-slate-200 text-slate-500"
                            : "bg-gradient-to-r from-sky-500 to-cyan-500 text-white shadow-[0_12px_30px_-15px_rgba(14,165,233,0.8)] hover:from-sky-600 hover:to-cyan-600"
                    }`}
                >
                    {uploading ? "Uploading..." : "Choose file"}
                </button>
                <div className="flex flex-wrap gap-2">
                    {supportedFormats.map(format => (
                        <span key={format} className="text-xs bg-slate-100 px-2 py-1 rounded-full text-slate-600">
                            {format}
                        </span>
                    ))}
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept=".pdf,.txt,image/jpeg,image/png,image/webp,.html,.htm,text/html"
            />

            {status && (
                <div className={`mt-4 rounded-xl border px-4 py-3 text-sm ${statusTone}`}>
                    {status}
                </div>
            )}
        </section>
    );
}