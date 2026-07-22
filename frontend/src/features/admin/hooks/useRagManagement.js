import { useState, useEffect, useCallback } from "react";
import {
    uploadDocument,
    getDocuments,
    resetKnowledgeBase,
    deleteDocument,
} from "@/features/admin/services/ragService.js";

const PAGE_SIZE = 10;

/**
 * Derive a user-friendly error message from an Axios error or plain Error.
 *
 * @param {unknown} err
 * @param {string} fallback
 * @returns {string}
 */
function extractError(err, fallback) {
    return (
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        fallback
    );
}

/**
 * Encapsulates all state and async logic for the RAG Knowledge Base
 * management section inside PhilosopherManagementPage.
 *
 * Pagination is server-side: each page navigation triggers a new GET request.
 */
export function useRagManagement() {
    // ── Document list ───────────────────────────────────────────
    const [documents, setDocuments] = useState([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [documentsError, setDocumentsError] = useState("");

    // ── Server-side pagination ──────────────────────────────────
    const [currentPage, setCurrentPage] = useState(0);   // 0-based (backend convention)
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const [hasNext, setHasNext] = useState(false);
    const [hasPrevious, setHasPrevious] = useState(false);

    // ── Upload ──────────────────────────────────────────────────
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState("");
    const [uploadError, setUploadError] = useState("");

    // ── Reset ───────────────────────────────────────────────────
    const [resetting, setResetting] = useState(false);
    const [resetMessage, setResetMessage] = useState("");
    const [resetError, setResetError] = useState("");

    // ── Document preview modal ────────────────────────────
    const [previewDoc, setPreviewDoc] = useState(null);
    const openPreview  = useCallback((doc) => setPreviewDoc(doc), []);
    const closePreview = useCallback(() => setPreviewDoc(null), []);

    // ── Fetch documents (server-side page) ──────────────────────
    const fetchDocuments = useCallback(async (page = 0) => {
        try {
            setLoadingDocuments(true);
            setDocumentsError("");

            const data = await getDocuments(page, PAGE_SIZE);

            setDocuments(data.content ?? []);
            setCurrentPage(data.page ?? page);
            setTotalPages(data.totalPages ?? 1);
            setTotalElements(data.totalElements ?? 0);
            setHasNext(data.hasNext ?? false);
            setHasPrevious(data.hasPrevious ?? false);
        } catch (err) {
            console.error("[RAG] fetchDocuments:", err);
            setDocumentsError(
                extractError(err, "Không tải được danh sách tài liệu RAG.")
            );
        } finally {
            setLoadingDocuments(false);
        }
    }, []);

    useEffect(() => {
        fetchDocuments(0);
    }, [fetchDocuments]);

    // ── Navigation helpers ──────────────────────────────────────
    const goNext = useCallback(() => {
        if (hasNext) fetchDocuments(currentPage + 1);
    }, [hasNext, currentPage, fetchDocuments]);

    const goPrev = useCallback(() => {
        if (hasPrevious) fetchDocuments(currentPage - 1);
    }, [hasPrevious, currentPage, fetchDocuments]);

    const goToPage = useCallback((page) => {
        if (page >= 0 && page < totalPages) fetchDocuments(page);
    }, [totalPages, fetchDocuments]);

    // ── Upload handler ──────────────────────────────────────────
    const handleUpload = useCallback(async () => {
        if (!selectedFile) {
            setUploadError("Vui lòng chọn một tệp trước khi tải lên.");
            return;
        }

        try {
            setUploading(true);
            setUploadMessage("");
            setUploadError("");

            await uploadDocument(selectedFile);

            setUploadMessage("Tải lên tài liệu thành công.");
            setSelectedFile(null);
            // Refresh current page so the new file appears
            await fetchDocuments(currentPage);
        } catch (err) {
            console.error("[RAG] handleUpload:", err);

            if (err.code === "ECONNABORTED" || err.message?.includes("timeout")) {
                setUploadError(
                    "Yêu cầu tải lên đã hết thời gian. Vui lòng thử lại."
                );
            } else if (!err.response) {
                setUploadError(
                    "Lỗi kết nối mạng. Kiểm tra kết nối và thử lại."
                );
            } else {
                setUploadError(
                    extractError(err, "Tải lên thất bại. Kiểm tra định dạng tệp hoặc quyền tài khoản.")
                );
            }
        } finally {
            setUploading(false);
        }
    }, [selectedFile, currentPage, fetchDocuments]);

    // ── Reset knowledge base handler ────────────────────────────
    const handleReset = useCallback(async () => {
        const confirmed = window.confirm(
            "Bạn có chắc chắn muốn xóa toàn bộ tài liệu không? Hành động này không thể hoàn tác."
        );
        if (!confirmed) return;

        try {
            setResetting(true);
            setResetMessage("");
            setResetError("");

            await resetKnowledgeBase();

            setResetMessage("Đã xóa toàn bộ tài liệu thành công.");
            await fetchDocuments(0);
        } catch (err) {
            console.error("[RAG] handleReset:", err);
            setResetError(
                extractError(err, "Không thể đặt lại cơ sở kiến thức. Vui lòng thử lại.")
            );
        } finally {
            setResetting(false);
        }
    }, [fetchDocuments]);

    // ── Delete specific document handler ────────────────────────
    const [deletingSource, setDeletingSource] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState("");
    const [deleteError, setDeleteError] = useState("");

    const handleDeleteDocument = useCallback(async (source) => {
        if (!source) return;
        
        try {
            setDeletingSource(source);
            setDeleteMessage("");
            setDeleteError("");

            await deleteDocument(source);

            setDeleteMessage(`Đã xóa tài liệu: ${source}`);
            // Refresh list
            await fetchDocuments(0); 
        } catch (err) {
            console.error("[RAG] handleDeleteDocument:", err);
            setDeleteError(
                extractError(err, "Xóa tài liệu thất bại.")
            );
        } finally {
            setDeletingSource(null);
        }
    }, [fetchDocuments]);

    // ── Clear transient messages ────────────────────────────────
    const clearUploadMessages = useCallback(() => {
        setUploadMessage("");
        setUploadError("");
    }, []);

    const clearResetMessages = useCallback(() => {
        setResetMessage("");
        setResetError("");
    }, []);

    return {
        // Document list (current page content only)
        documents,
        loadingDocuments,
        documentsError,
        fetchDocuments,

        // Server-side pagination
        currentPage,       // 0-based
        totalPages,
        totalElements,
        hasNext,
        hasPrevious,
        goNext,
        goPrev,
        goToPage,

        // Document preview
        previewDoc,
        openPreview,
        closePreview,

        // Upload
        selectedFile,
        setSelectedFile,
        uploading,
        uploadMessage,
        uploadError,
        handleUpload,
        clearUploadMessages,

        // Reset
        resetting,
        resetMessage,
        resetError,
        handleReset,
        clearResetMessages,
        
        deletingSource,
        deleteMessage,
        deleteError,
        handleDeleteDocument,
    };
}
