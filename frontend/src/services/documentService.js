import apiClient from './apiClient';

/**
 * Lấy danh sách tài liệu từ S3 thông qua backend API
 * @returns {Promise<Array>} Danh sách DocumentDistributionResponse
 */
export async function fetchDocuments() {
    const response = await apiClient.get('/documents');
    // Backend trả về ApiResponse { code, message, result: [...] }
    return response.data?.result ?? [];
}

/**
 * Tải lên tài liệu mới
 * @param {FormData} formData
 * @returns {Promise<object>}
 */
export async function uploadDocument(formData) {
    const response = await apiClient.post('/documents', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data?.result;
}

/**
 * Cập nhật tài liệu
 * @param {string} key
 * @param {FormData} formData
 * @returns {Promise<object>}
 */
export async function updateDocument(key, formData) {
    const response = await apiClient.put(`/documents?key=${encodeURIComponent(key)}`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
    return response.data?.result;
}

/**
 * Xóa tài liệu
 * @param {string} key
 * @returns {Promise<object>}
 */
export async function deleteDocument(key) {
    const response = await apiClient.delete(`/documents?key=${encodeURIComponent(key)}`);
    return response.data?.result;
}

/**
 * Tải file từ S3 thông qua download URL
 * @param {string} downloadUrl - URL tải file do backend cung cấp
 * @param {string} fileName - Tên file để lưu xuống
 */
export function downloadDocument(downloadUrl, fileName) {
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = fileName;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

/**
 * Suy luận icon và màu sắc dựa trên content type
 * @param {string} contentType
 * @returns {{ icon: string, color: string, label: string }}
 */
export function getFileTypeInfo(contentType) {
    if (contentType?.includes('pdf')) {
        return { icon: 'picture_as_pdf', color: 'text-secondary', label: 'PDF' };
    }
    if (contentType?.includes('markdown') || contentType?.includes('md')) {
        return { icon: 'description', color: 'text-primary', label: 'Markdown' };
    }
    if (contentType?.includes('text')) {
        return { icon: 'article', color: 'text-tertiary', label: 'Text' };
    }
    return { icon: 'folder', color: 'text-on-surface-variant', label: 'File' };
}

/**
 * Định dạng kích thước file
 * @param {number} bytes
 * @returns {string}
 */
export function formatFileSize(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Định dạng ngày giờ
 * @param {string} isoString
 * @returns {string}
 */
export function formatDate(isoString) {
    if (!isoString) return '—';
    return new Date(isoString).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}
