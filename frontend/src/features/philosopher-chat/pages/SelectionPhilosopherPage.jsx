import { motion } from "motion/react";
import { useState, useEffect } from "react";
import apiClient from "@/services/apiClient.js";

export function SelectionPhilosopherPage({ onSelect }) {
  const [philosophers, setPhilosophers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPhilosophers = async () => {
      try {
        const response = await apiClient.get("/philosophers/");
        if (response.data?.code === 1000) {
          setPhilosophers(response.data.result || []);
        }
      } catch (error) {
        console.error("Failed to fetch philosophers:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPhilosophers();
  }, []);

  const limitedPhilosophers = philosophers.slice(0, 2);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-on-surface-variant italic">Đang tải danh sách đàm đạo...</p>
      </div>
    );
  }

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
        {limitedPhilosophers.map((phil) => (
          <div
            key={phil.id}
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
          </div>
        ))}
      </div>
    </motion.div>
  );
}
