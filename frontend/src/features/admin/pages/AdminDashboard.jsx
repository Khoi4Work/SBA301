import React from "react";
import { useAdminStats } from "@/features/admin/hooks/useAdminStats.js";

export default function AdminDashboard() {
    const { displayName, userCount, philosopherCount, chapterCount, statsLoading } = useAdminStats();

    return (
        <div className="animate-fade-in">
            {/* Welcome, Header */}
            <section className="mb-12">
                <h2 className="font-display text-5xl text-on-surface mb-2 font-bold tracking-tight">Bảng điều khiển Tổng quan</h2>
                <p className="text-lg text-on-surface-variant max-w-2xl">Chào mừng {displayName}, đây là tóm lược hoạt động của viện.</p>
            </section>

            {/* Key Metric Cards */}
            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-12">
                <div className="folio-card bg-surface-container-low p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <span className="material-symbols-outlined text-secondary">groups</span>
                    </div>
                    <span className="text-on-surface-variant font-semibold uppercase text-xs tracking-wider">Học giả (Scholars)</span>
                    <span className="text-3xl font-display font-semibold mt-1">
                        {statsLoading ? "..." : userCount}
                    </span>
                </div>

                <div className="folio-card bg-surface-container-low p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <span className="material-symbols-outlined text-secondary">psychology</span>
                    </div>
                    <span className="text-on-surface-variant font-semibold uppercase text-xs tracking-wider">Triết gia AI</span>
                    <span className="text-3xl font-display font-semibold mt-1">
                        {statsLoading ? "..." : philosopherCount}
                    </span>
                </div>

                <div className="folio-card bg-surface-container-low p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <span className="material-symbols-outlined text-secondary">menu_book</span>
                    </div>
                    <span className="text-on-surface-variant font-semibold uppercase text-xs tracking-wider">Chương học</span>
                    <span className="text-3xl font-display font-semibold mt-1">
                        {statsLoading ? "..." : chapterCount}
                    </span>
                </div>

            </section>

            {/* Visual Charts Section */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-gutter mb-12">
                <div className="lg:col-span-2 folio-card bg-surface-container-low p-8 min-h-[400px] flex flex-col">
                    <div className="flex justify-between items-center mb-10">
                        <h3 className="font-display text-2xl font-semibold">Tăng trưởng Học giả</h3>
                        <div className="flex gap-4 text-xs font-semibold text-on-surface-variant/60">
                            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-secondary"></span> Dự kiến</span>
                            <span className="flex items-center gap-1"><span className="w-2 h-2 bg-secondary/30"></span> Thực tế</span>
                        </div>
                    </div>

                    <div className="flex-1 flex items-end justify-between gap-4 px-4 pb-2">
                        {[60, 75, 65, 90, 82, 100].map((height, i) => (
                            <div key={i} className="flex flex-col items-center gap-2 w-full">
                                <div className="w-full bg-secondary/10 relative h-[180px]">
                                    <div
                                        className={`absolute bottom-0 left-0 right-0 ${i === 5 ? 'bg-secondary' : 'bg-secondary/40'}`}
                                        style={{ height: `${height}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] uppercase tracking-tighter text-on-surface-variant">Tháng {i + 1}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="folio-card bg-surface-container-low p-8 flex flex-col">
                    <h3 className="font-display text-2xl font-semibold mb-8">Phân loại Triết gia</h3>
                    <div className="flex-1 flex flex-col justify-center gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-2 bg-secondary"></div>
                            <span className="text-sm font-semibold flex-1">Stoic (Khắc kỷ)</span>
                            <span className="text-sm font-bold text-secondary">40%</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-2 bg-secondary/70"></div>
                            <span className="text-sm font-semibold flex-1">Socratic (Socrates)</span>
                            <span className="text-sm font-bold text-secondary">25%</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-8 h-2 bg-secondary/50"></div>
                            <span className="text-sm font-semibold flex-1">Epicurean (Khoái lạc)</span>
                            <span className="text-sm font-bold text-secondary">20%</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-6 h-2 bg-secondary/30"></div>
                            <span className="text-sm font-semibold flex-1">Cynic (Hoài nghi)</span>
                            <span className="text-sm font-bold text-secondary">10%</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="w-4 h-2 bg-secondary/10"></div>
                            <span className="text-sm font-semibold flex-1">Others</span>
                            <span className="text-sm font-bold text-secondary">5%</span>
                        </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-outline/30 text-center">
                        <button className="text-secondary text-xs uppercase tracking-widest font-bold hover:underline">Xem chi tiết lưu trữ</button>
                    </div>
                </div>
            </section>

        </div>


    );
}
