import React, { useEffect, useState } from "react";
import { getDocumentChunks } from "@/features/admin/services/ragService.js";

/**
 * Modal that displays the metadata and content of a single RAG document chunk.
 * Matches the project's existing backdrop + card design (ConfirmModal pattern).
 *
 * @param {{ doc: object|null, onClose: () => void }} props
 */
export default function DocumentPreviewModal({ doc, onClose }) {
    const [chunkPage, setChunkPage] = useState(0);
    const [chunkData, setChunkData] = useState(null);
    const [loadingChunk, setLoadingChunk] = useState(false);
    const [chunkError, setChunkError] = useState("");

    // Reset page when doc changes
    useEffect(() => {
        setChunkPage(0);
    }, [doc]);

    // Fetch chunk data when page or doc changes
    useEffect(() => {
        if (!doc) return;
        const source = doc.fileName || doc.source;
        if (!source) return;

        let isMounted = true;
        const fetchChunk = async () => {
            try {
                setLoadingChunk(true);
                setChunkError("");
                const res = await getDocumentChunks(source, chunkPage, 1);
                if (isMounted) {
                    setChunkData(res);
                }
            } catch (err) {
                if (isMounted) {
                    setChunkError("Không thể tải nội dung chunk.");
                    console.error("[RAG] getDocumentChunks error:", err);
                }
            } finally {
                if (isMounted) setLoadingChunk(false);
            }
        };

        fetchChunk();
        return () => { isMounted = false; };
    }, [doc, chunkPage]);

    // Close on Escape key
    useEffect(() => {
        if (!doc) return;
        const handleKey = (e) => { if (e.key === "Escape") onClose(); };
        window.addEventListener("keydown", handleKey);
        return () => window.removeEventListener("keydown", handleKey);
    }, [doc, onClose]);

    if (!doc) return null;

    const fileName   = doc.fileName || doc.source || "—";
    const uploadDate = doc.uploadedAt || doc.uploadDate;
    const chunks     = doc.chunkCount   ?? "—";
    const avgLen     = doc.avgChunkLength != null
        ? Math.round(doc.avgChunkLength) + " ký tự"
        : "—";
    const fileType   = doc.contentType  || "—";
    const fileSize   = doc.contentLength
        ? (parseInt(doc.contentLength, 10) / 1024).toFixed(1) + " KB"
        : "—";
    
    // We use the fetched chunk data if available, fallback to doc.content
    const displayedContent = chunkData?.content?.[0]?.content || doc.content || null;
    const totalChunks = chunkData?.totalElements || chunks;

    const dateLabel = uploadDate
        ? new Date(uploadDate).toLocaleString("vi-VN", {
              year: "numeric", month: "long", day: "numeric",
              hour: "2-digit", minute: "2-digit",
          })
        : "—";

    return (
        /* Backdrop */
        <div
            className="fixed inset-0 z-[10000] bg-black/70 backdrop-blur-sm flex items-center justify-center px-4 animate-fade-in"
            onClick={onClose}
        >
            {/* Modal card – stop propagation so clicking inside doesn't close */}
            <section
                className="w-full max-w-2xl max-h-[90vh] flex flex-col bg-surface-container-lowest border border-secondary/20 shadow-2xl animate-zoom-in overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* ── Header ── */}
                <div className="px-6 py-5 border-b border-secondary/10 bg-surface-container-high/30 flex items-start justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-sm bg-secondary/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-secondary text-[20px]">
                                description
                            </span>
                        </div>
                        <div className="min-w-0">
                            <p className="font-display text-base font-semibold text-on-surface truncate" title={fileName}>
                                {fileName}
                            </p>
                            <p className="text-[11px] text-on-surface-variant opacity-60 uppercase tracking-widest mt-0.5">
                                Tài liệu RAG
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-1.5 text-on-surface-variant hover:text-on-surface hover:bg-secondary/10 transition-all shrink-0"
                        title="Đóng"
                    >
                        <span className="material-symbols-outlined text-[20px] leading-none">close</span>
                    </button>
                </div>

                {/* ── Metadata grid ── */}
                <div className="px-6 py-5 border-b border-secondary/10 bg-surface-container-high/10 shrink-0">
                    <p className="text-secondary/80 text-[11px] uppercase tracking-widest font-semibold mb-4">
                        Thông tin tệp
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <MetaItem icon="schedule" label="Tải lên" value={dateLabel} />
                        <MetaItem icon="layers"   label="Số chunks" value={String(chunks)} />
                        <MetaItem icon="straighten" label="TB mỗi chunk" value={avgLen} />
                        <MetaItem icon="folder_zip" label="Kích thước" value={fileSize} />
                    </div>
                    {fileType !== "—" && (
                        <p className="mt-3 text-[11px] text-on-surface-variant opacity-50">
                            Content-Type: <span className="font-mono">{fileType}</span>
                        </p>
                    )}
                </div>

                {/* ── Content preview ── */}
                <div className="flex-1 overflow-y-auto px-6 py-5">
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-secondary/80 text-[11px] uppercase tracking-widest font-semibold">
                            Nội dung chi tiết (Đọc theo Chunk)
                        </p>
                        
                        {/* Pagination controls for Chunks */}
                        {chunkData && totalChunks > 0 && (
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => setChunkPage(p => Math.max(0, p - 1))}
                                    disabled={!chunkData.hasPrevious || loadingChunk}
                                    className="p-1 border border-secondary/20 rounded hover:bg-secondary/10 text-secondary disabled:opacity-30 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[16px] leading-none">chevron_left</span>
                                </button>
                                <span className="text-[11px] font-mono text-on-surface-variant opacity-70">
                                    Chunk {chunkPage + 1} / {totalChunks}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => setChunkPage(p => p + 1)}
                                    disabled={!chunkData.hasNext || loadingChunk}
                                    className="p-1 border border-secondary/20 rounded hover:bg-secondary/10 text-secondary disabled:opacity-30 transition-colors"
                                >
                                    <span className="material-symbols-outlined text-[16px] leading-none">chevron_right</span>
                                </button>
                            </div>
                        )}
                    </div>
                    
                    {loadingChunk ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="w-8 h-8 rounded-full border-[3px] border-secondary/20 border-t-secondary animate-spin mb-4"></div>
                            <p className="text-sm text-on-surface-variant">Đang tải nội dung chunk...</p>
                        </div>
                    ) : chunkError ? (
                        <div className="flex flex-col items-center justify-center py-12 text-center text-error">
                            <span className="material-symbols-outlined text-[40px] opacity-80 mb-3">error</span>
                            <p className="text-sm">{chunkError}</p>
                        </div>
                    ) : displayedContent ? (
                        <pre className="text-sm text-on-surface-variant font-mono leading-relaxed whitespace-pre-wrap break-words bg-surface-container-high/20 border border-secondary/10 p-4 min-h-[150px]">
                            {displayedContent}
                        </pre>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <span className="material-symbols-outlined text-[40px] text-on-surface-variant opacity-25 mb-3">
                                text_snippet
                            </span>
                            <p className="text-sm text-on-surface-variant opacity-50">
                                Không có dữ liệu nội dung.
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Footer ── */}
                <div className="px-6 py-4 border-t border-secondary/10 bg-surface-container-high/10 flex justify-end shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-2 border border-secondary/20 text-on-surface-variant hover:bg-secondary/5 transition-all text-xs uppercase tracking-widest font-semibold"
                    >
                        Đóng
                    </button>
                </div>
            </section>
        </div>
    );
}

function MetaItem({ icon, label, value }) {
    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-on-surface-variant opacity-60">
                <span className="material-symbols-outlined text-[14px]">{icon}</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold">{label}</span>
            </div>
            <p className="text-sm text-on-surface font-medium">{value}</p>
        </div>
    );
}
