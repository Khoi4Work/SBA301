import { useState, useMemo } from "react";

/**
 * Hook for client-side pagination.
 *
 * @param {Array} items - The full list of items to paginate
 * @param {number} [itemsPerPage=6] - Items per page
 * @returns {{ currentPage, totalPages, paginatedItems, setCurrentPage, goNext, goPrev }}
 */
export function usePagination(items = [], itemsPerPage = 6) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(items.length / itemsPerPage));

    // Reset to page 1 if items shrink below the current page
    const safePage = Math.min(currentPage, totalPages);

    const paginatedItems = useMemo(() => {
        const start = (safePage - 1) * itemsPerPage;
        return items.slice(start, start + itemsPerPage);
    }, [items, safePage, itemsPerPage]);

    const goNext = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
    const goPrev = () => setCurrentPage((p) => Math.max(p - 1, 1));

    return {
        currentPage: safePage,
        totalPages,
        paginatedItems,
        setCurrentPage,
        goNext,
        goPrev,
    };
}
