import React from "react";
import { useAdminStats } from "@/features/admin/hooks/useAdminStats.js";
import LearnerGrowthChart from "@/features/admin/components/LearnerGrowthChart.jsx";

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
                <div className="lg:col-span-3">
                    <LearnerGrowthChart />
                </div>
            </section>

        </div>
    );
}
