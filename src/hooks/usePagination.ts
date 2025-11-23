import { useState, useMemo } from "react";

export function usePagination<T>(data: T[], itemsPerPage: number = 13) {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return data.slice(startIndex, endIndex);
    }, [data, currentPage, itemsPerPage]);

    // Reset to page 1 if data length changes significantly or if current page is out of bounds
    // Note: This might need adjustment depending on desired behavior when filtering
    useMemo(() => {
        if (currentPage > totalPages) {
            setCurrentPage(1);
        }
    }, [totalPages, currentPage]);

    return {
        currentPage,
        setCurrentPage,
        totalPages,
        paginatedData,
        itemsPerPage,
        totalItems: data.length,
    };
}
