import { useState, useEffect, useCallback } from "react";
import {
    uploadDocument,
    getDocuments,
    resetKnowledgeBase,
} from "@/features/admin/services/ragService.js";

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
 */
export function useRagManagement() {
    // ── Document list ───────────────────────────────────────────
    const [documents, setDocuments] = useState([]);
    const [loadingDocuments, setLoadingDocuments] = useState(false);
    const [documentsError, setDocumentsError] = useState("");

    // ── Upload ──────────────────────────────────────────────────
    const [selectedFile, setSelectedFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState("");
    const [uploadError, setUploadError] = useState("");

    // ── Reset ───────────────────────────────────────────────────
    const [resetting, setResetting] = useState(false);
    const [resetMessage, setResetMessage] = useState("");
    const [resetError, setResetError] = useState("");

    // ── Fetch documents ─────────────────────────────────────────
    const fetchDocuments = useCallback(async () => {
        try {
            setLoadingDocuments(true);
            setDocumentsError("");
            const data = await getDocuments();
            setDocuments(data);
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
        fetchDocuments();
    }, [fetchDocuments]);

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
            await fetchDocuments();
        } catch (err) {
            console.error("[RAG] handleUpload:", err);

            // Distinguish common network / timeout errors for better UX
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
    }, [selectedFile, fetchDocuments]);

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
            await fetchDocuments();
        } catch (err) {
            console.error("[RAG] handleReset:", err);
            setResetError(
                extractError(err, "Không thể đặt lại cơ sở kiến thức. Vui lòng thử lại.")
            );
        } finally {
            setResetting(false);
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
        // Document list
        documents,
        loadingDocuments,
        documentsError,
        fetchDocuments,

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
    };
}
