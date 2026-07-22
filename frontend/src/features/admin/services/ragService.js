import { apiRag } from "@/services/apiRag.js";

/**
 * Unwrap the actual payload from various API response shapes used across this
 * backend:  { data }, { result }, { message }, or the raw body itself.
 *
 * @param {import("axios").AxiosResponse} response
 * @returns {*}
 */
const unwrap = (response) =>
    response.data?.data ?? response.data?.result ?? response.data;

/**
 * Upload a single document file to the RAG knowledge base.
 *
 * POST /api/rag   (multipart/form-data, field name: "file")
 *
 * @param {File} file
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function uploadDocument(file) {
    const response = await apiRag.uploadDocument(file);
    return unwrap(response);
}

/**
 * Fetch the list of documents currently stored in the knowledge base.
 *
 * GET /api/rag/documents
 *
 * @returns {Promise<Array<{ id: number, fileName: string, uploadedAt: string }>>}
 */
export async function getDocuments() {
    const response = await apiRag.getDocuments();
    const data = unwrap(response);
    // The endpoint may return a bare array or a wrapped array.
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.documents)) return data.documents;
    return [];
}

/**
 * Delete all documents and reset the RAG vector index.
 *
 * DELETE /api/rag/reset
 *
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function resetKnowledgeBase() {
    const response = await apiRag.resetKnowledgeBase();
    return unwrap(response);
}
