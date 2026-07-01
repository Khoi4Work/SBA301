/**
 * Extract array data from various API response shapes.
 * Handles: raw array, { data: [] }, { result: [] }, { content: [] },
 *          { users: [] }, { philosophers: [] }, { documents: [] }.
 *
 * @param {*} data - The API response data
 * @returns {Array} The extracted array, or [] if not found
 */
export function extractResponse(data) {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.result)) return data.result;
    if (Array.isArray(data?.content)) return data.content;
    if (Array.isArray(data?.users)) return data.users;
    if (Array.isArray(data?.philosophers)) return data.philosophers;
    if (Array.isArray(data?.documents)) return data.documents;

    console.warn("extractResponse: Could not find array in response:", data);
    return [];
}
