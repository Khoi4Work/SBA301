import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import apiClient from "@/services/apiClient.js";

// Skeleton Component for loading state
const PhilosopherSkeleton = () => (
  <div className="bg-surface-container-low ink-border p-6 animate-pulse">
    <div className="relative mb-6 aspect-[4/5] bg-outline-variant/20 rounded-sm" />
    <div className="h-8 w-3/4 bg-outline-variant/20 mb-2" />
    <div className="h-4 w-1/4 bg-outline-variant/20 mb-4" />
    <div className="space-y-2 mb-4">
      <div className="h-3 w-full bg-outline-variant/10" />
      <div className="h-3 w-full bg-outline-variant/10" />
      <div className="h-3 w-2/3 bg-outline-variant/10" />
    </div>
    <div className="h-4 w-full bg-outline-variant/20 pt-4 border-t border-outline-variant/10" />
  </div>
);

export function SelectionPhilosopherPage({ onSelect }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [philosophers, setPhilosophers] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 0,
    totalElements: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  const currentPage = parseInt(searchParams.get("page")) || 0;

  useEffect(() => {
    const fetchPhilosophers = async () => {
      setIsLoading(true);
      try {
        const response = await apiClient.get("/philosophers/", {
          params: {
            page: currentPage,
            size: 2,
          },
        });
        if (response.data?.code === 1000) {
          const result = response.data.result;
          setPhilosophers(result.content || []);
          setPagination({
            currentPage: result.currentPage,
            totalPages: result.totalPages,
            totalElements: result.totalElements,
          });
        }
      } catch (error) {
        console.error("Failed to fetch philosophers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhilosophers();
  }, [currentPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 0 && newPage < pagination.totalPages) {
      setSearchParams({ page: newPage });
    }
  };

  const getPaginationRange = () => {
    const { totalPages } = pagination;
    const current = currentPage;
    const range = [];
    const delta = 1; // Số trang hiển thị hai bên trang hiện tại

    for (let i = 0; i < totalPages; i++) {
      if (
        i === 0 || // Luôn hiện trang đầu
        i === totalPages - 1 || // Luôn hiện trang cuối
        (i >= current - delta && i <= current + delta) // Hiện các trang xung quanh trang hiện tại
      ) {
        range.push(i);
      } else if (
        (i === current - delta - 1 && current - delta - 1 > 0) ||
        (i === current + delta + 1 && current + delta + 1 < totalPages - 1)
      ) {
        range.push("...");
      }
    }

    // Lọc bỏ các dấu "..." trùng lặp liên tiếp
    return range.filter((item, index) => {
      if (item === "...") {
        return range[index - 1] !== "...";
      }
      return true;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-[1200px] mx-auto pt-32 pb-20 px-4 md:px-16"
    >
      <header className="text-center mb-16">
        <h1 className="font-display text-5xl text-on-surface mb-4 font-bold">
          Chọn người đàm đạo
        </h1>
        <p className="text-lg text-on-surface-variant max-w-2xl mx-auto italic leading-relaxed">
          "Một cuộc đời không được xem xét thì không đáng sống." — Bước vào hư
          vô và tìm thấy sự thật thông qua những cuộc đối thoại vượt thời gian.
        </p>
        <div className="w-24 h-px bg-secondary mx-auto mt-8"></div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <>
              <PhilosopherSkeleton />
              <PhilosopherSkeleton />
            </>
          ) : (
            philosophers.map((phil) => (
              <motion.div
                key={phil.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                onClick={() => onSelect(phil)}
                className="group cursor-pointer bg-surface-container-low ink-border p-6 hover:bg-surface-container-high transition-all duration-500 transform hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="relative mb-6 aspect-[4/5] overflow-hidden grayscale group-hover:grayscale-0 transition-all duration-700">
                  <img
                    src={phil.imageUrl}
                    alt={phil.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-secondary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>

                <h3 className="font-display text-2xl text-primary mb-2 font-medium">
                  {phil.name}
                </h3>
                <p className="text-xs uppercase tracking-widest text-secondary mb-4 font-medium">
                  {phil.category}
                </p>
                <p className="text-base text-on-surface-variant italic mb-4 line-clamp-4">
                  {phil.quote}
                </p>

                <div className="text-on-surface text-sm font-semibold mt-auto pt-4 border-t border-outline-variant/10">
                  CỐT LÕI: {phil.core}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Pagination Controls */}
      {!isLoading && pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-16">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0 || isLoading}
            className="p-2 rounded-full bg-surface-container-low ink-border text-on-surface disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container-high transition-all"
          >
            <span className="px-2">Trước</span>
          </button>

          <div className="flex items-center gap-2">
            {getPaginationRange().map((page, index) => (
              page === "..." ? (
                <span key={`ellipsis-${index}`} className="w-10 h-10 flex items-center justify-center text-on-surface-variant">
                  ...
                </span>
              ) : (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  disabled={isLoading}
                  className={`w-10 h-10 rounded-full transition-all ink-border ${
                    currentPage === page
                      ? "bg-primary text-on-primary"
                      : "bg-surface-container-low text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  {page + 1}
                </button>
              )
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === pagination.totalPages - 1 || isLoading}
            className="p-2 rounded-full bg-surface-container-low ink-border text-on-surface disabled:opacity-30 disabled:cursor-not-allowed hover:bg-surface-container-high transition-all"
          >
            <span className="px-2">Sau</span>
          </button>
        </div>
      )}
    </motion.div>
  );
}
