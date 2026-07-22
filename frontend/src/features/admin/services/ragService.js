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
 * Fetch a paginated page of documents from the knowledge base.
 *
 * GET /api/rag/documents?page=&size=
 *
 * @param {number} [page=0]  - Zero-based page index
 * @param {number} [size=10] - Items per page
 * @returns {Promise<{
 *   content: Array,
 *   page: number,
 *   size: number,
 *   totalElements: number,
 *   totalPages: number,
 *   first: boolean,
 *   last: boolean,
 *   hasNext: boolean,
 *   hasPrevious: boolean
 * }>}
 */
export async function getDocuments(page = 0, size = 10) {
    const response = await apiRag.getDocuments(page, size);
    const data = unwrap(response);

    // Backend returns a PageResponse envelope with a `content` array.
    // Guard against old array-only responses during migration.
    if (Array.isArray(data)) {
        return {
            content: data,
            page: 0,
            size: data.length,
            totalElements: data.length,
            totalPages: 1,
            first: true,
            last: true,
            hasNext: false,
            hasPrevious: false,
        };
    }

    return data;
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

/**
 * Delete a specific document by its source name.
 *
 * DELETE /api/rag/documents?source=...
 *
 * @param {string} source
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export async function deleteDocument(source) {
    const response = await apiRag.deleteDocument(source);
    return unwrap(response);
}

/**
 * Fetch a paginated page of chunks for a specific document.
 *
 * GET /api/rag/documents/chunks?source=...&page=&size=
 *
 * @param {string} source
 * @param {number} [page=0]
 * @param {number} [size=1]
 * @returns {Promise<any>}
 */
export async function getDocumentChunks(source, page = 0, size = 1) {
    const response = await apiRag.getDocumentChunks(source, page, size);
    return unwrap(response);
}
